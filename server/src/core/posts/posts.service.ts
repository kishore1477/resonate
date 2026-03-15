import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new post
   */
  async create(boardId: string, authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        boardId,
        authorId,
        title: dto.title,
        content: dto.content,
        categoryId: dto.categoryId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });

    return post;
  }

  /**
   * Get posts for a board with filtering and pagination
   */
  async findAll(boardId: string, query: QueryPostsDto, userId?: string) {
    const where: any = {
      boardId,
      deletedAt: null,
      mergedIntoId: null, // Don't show merged posts
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (query.sort) {
      case 'votes':
        orderBy.voteCount = 'desc';
        break;
      case 'comments':
        orderBy.commentCount = 'desc';
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: true,
          votes: userId ? {
            where: { voterId: userId },
            select: { value: true },
          } : false,
          _count: {
            select: { comments: { where: { deletedAt: null } } },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          orderBy,
        ],
        skip: query.skip || 0,
        take: query.take || 20,
      }),
      this.prisma.post.count({ where }),
    ]);

    // Transform to include user's vote
    const transformedPosts = posts.map((post) => ({
      ...post,
      userVote: userId && post.votes?.[0]?.value || null,
      votes: undefined,
    }));

    return {
      data: transformedPosts,
      meta: {
        total,
        skip: query.skip || 0,
        take: query.take || 20,
      },
    };
  }

  /**
   * Get single post by ID
   */
  async findById(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        board: {
          select: { id: true, name: true, slug: true, workspaceId: true },
        },
        votes: userId ? {
          where: { voterId: userId },
          select: { value: true },
        } : false,
        mergedPosts: {
          select: { id: true, title: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      userVote: userId && post.votes?.[0]?.value || null,
      votes: undefined,
    };
  }

  /**
   * Update post
   */
  async update(
    id: string,
    dto: UpdatePostDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const post = await this.findById(id);

    // Only author or admin can edit
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Cannot edit this post');
    }

    // Track status change
    if (dto.status && dto.status !== post.status) {
      await this.prisma.postStatusHistory.create({
        data: {
          postId: id,
          fromStatus: post.status,
          toStatus: dto.status,
          changedBy: userId,
        },
      });
    }

    return this.prisma.post.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });
  }

  /**
   * Update post status (admin only)
   */
  async updateStatus(id: string, status: PostStatus, userId: string) {
    const post = await this.findById(id);

    await this.prisma.postStatusHistory.create({
      data: {
        postId: id,
        fromStatus: post.status,
        toStatus: status,
        changedBy: userId,
      },
    });

    return this.prisma.post.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Merge duplicate posts
   */
  async merge(targetId: string, sourceIds: string[], userId: string) {
    const target = await this.findById(targetId);

    // Update all source posts to point to target
    await this.prisma.post.updateMany({
      where: { id: { in: sourceIds } },
      data: { mergedIntoId: targetId },
    });

    // Move votes from source to target (if not already voted)
    for (const sourceId of sourceIds) {
      const sourceVotes = await this.prisma.vote.findMany({
        where: { postId: sourceId },
      });

      for (const vote of sourceVotes) {
        const existingVote = await this.prisma.vote.findUnique({
          where: {
            postId_voterId: {
              postId: targetId,
              voterId: vote.voterId,
            },
          },
        });

        if (!existingVote) {
          await this.prisma.vote.create({
            data: {
              postId: targetId,
              voterId: vote.voterId,
              value: vote.value,
            },
          });
        }
      }
    }

    // Recalculate vote count
    const voteCount = await this.prisma.vote.count({
      where: { postId: targetId },
    });

    return this.prisma.post.update({
      where: { id: targetId },
      data: { voteCount },
    });
  }

  /**
   * Soft delete post
   */
  async delete(id: string, userId: string, isAdmin: boolean) {
    const post = await this.findById(id);

    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Cannot delete this post');
    }

    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
