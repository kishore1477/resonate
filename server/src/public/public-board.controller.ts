import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { PostsService } from '../core/posts/posts.service';
import { QueryPostsDto } from '../core/posts/dto/query-posts.dto';

@ApiTags('public')
@Controller('public/:workspaceSlug')
export class PublicBoardController {
  constructor(
    private prisma: PrismaService,
    private postsService: PostsService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get public workspace info' })
  async getWorkspace(@Param('workspaceSlug') workspaceSlug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        primaryColor: true,
        accentColor: true,
      },
    });

    if (!workspace) {
      return null;
    }

    return workspace;
  }

  @Get('boards')
  @ApiOperation({ summary: 'Get public boards' })
  async getBoards(@Param('workspaceSlug') workspaceSlug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return [];
    }

    return this.prisma.board.findMany({
      where: {
        workspaceId: workspace.id,
        isPublic: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            posts: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  @Get('boards/:boardSlug')
  @ApiOperation({ summary: 'Get public board details' })
  async getBoard(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('boardSlug') boardSlug: string,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return null;
    }

    return this.prisma.board.findUnique({
      where: {
        workspaceId_slug: { workspaceId: workspace.id, slug: boardSlug },
        isPublic: true,
        deletedAt: null,
      },
      include: {
        categories: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  @Get('boards/:boardSlug/posts')
  @ApiOperation({ summary: 'Get public posts' })
  async getPosts(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('boardSlug') boardSlug: string,
    @Query() query: QueryPostsDto,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return { data: [], meta: { total: 0 } };
    }

    const board = await this.prisma.board.findUnique({
      where: {
        workspaceId_slug: { workspaceId: workspace.id, slug: boardSlug },
        isPublic: true,
      },
    });

    if (!board) {
      return { data: [], meta: { total: 0 } };
    }

    return this.postsService.findAll(board.id, query);
  }
}
