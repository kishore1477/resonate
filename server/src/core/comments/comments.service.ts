import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a comment on a post
   */
  async create(
    postId: string,
    authorId: string,
    content: string,
    parentId?: string,
    isInternal = false,
  ) {
    const comment = await this.prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          postId,
          authorId,
          content,
          parentId,
          isInternal,
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Update comment count on post
      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return newComment;
    });

    return comment;
  }

  /**
   * Get comments for a post
   */
  async findAll(postId: string, includeInternal = false) {
    const where: any = {
      postId,
      deletedAt: null,
      parentId: null, // Top-level comments only
    };

    if (!includeInternal) {
      where.isInternal = false;
    }

    const comments = await this.prisma.comment.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        replies: {
          where: includeInternal ? { deletedAt: null } : { deletedAt: null, isInternal: false },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  /**
   * Update a comment
   */
  async update(id: string, content: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Cannot edit this comment');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  /**
   * Soft delete a comment
   */
  async delete(id: string, userId: string, isAdmin = false) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      });
    });

    return { success: true };
  }
}
