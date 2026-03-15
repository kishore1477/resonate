import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole, Membership } from '@prisma/client';
import { BoardsService } from '../boards/boards.service';

interface RequestWithMembership extends Request {
  membership: Membership;
}

@ApiTags('posts')
@ApiBearerAuth()
@Controller('boards/:boardId/posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly boardsService: BoardsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  async create(
    @Param('boardId') boardId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    // Verify board exists
    await this.boardsService.findById(boardId);
    return this.postsService.create(boardId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts in board' })
  async findAll(
    @Param('boardId') boardId: string,
    @Query() query: QueryPostsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.findAll(boardId, query, userId);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get post by ID' })
  async findOne(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.findById(postId, userId);
  }

  @Patch(':postId')
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePostDto,
    @Req() req: RequestWithMembership,
  ) {
    const isAdmin = req.membership?.role === MemberRole.ADMIN ||
      req.membership?.role === MemberRole.OWNER;
    return this.postsService.update(postId, dto, userId, isAdmin);
  }

  @Patch(':postId/status')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update post status (admin only)' })
  async updateStatus(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { status: string },
  ) {
    return this.postsService.updateStatus(postId, body.status as any, userId);
  }

  @Post(':postId/merge')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Merge duplicate posts' })
  async merge(
    @Param('postId') targetId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { sourceIds: string[] },
  ) {
    return this.postsService.merge(targetId, body.sourceIds, userId);
  }

  @Delete(':postId')
  @ApiOperation({ summary: 'Delete post' })
  async delete(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Req() req: RequestWithMembership,
  ) {
    const isAdmin = req.membership?.role === MemberRole.ADMIN ||
      req.membership?.role === MemberRole.OWNER;
    return this.postsService.delete(postId, userId, isAdmin);
  }
}
