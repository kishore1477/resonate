import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MemberRole, Membership } from '@prisma/client';

interface RequestWithMembership extends Request {
  membership?: Membership;
}

@ApiTags('comments')
@ApiBearerAuth()
@Controller('posts/:postId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a comment' })
  async create(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { content: string; parentId?: string; isInternal?: boolean },
  ) {
    return this.commentsService.create(
      postId,
      userId,
      body.content,
      body.parentId,
      body.isInternal,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for a post' })
  async findAll(
    @Param('postId') postId: string,
    @Req() req: RequestWithMembership,
  ) {
    // Include internal comments only for team members
    const includeInternal = !!req.membership;
    return this.commentsService.findAll(postId, includeInternal);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update a comment' })
  async update(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { content: string },
  ) {
    return this.commentsService.update(commentId, body.content, userId);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  async delete(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @Req() req: RequestWithMembership,
  ) {
    const isAdmin = req.membership?.role === MemberRole.ADMIN ||
      req.membership?.role === MemberRole.OWNER;
    return this.commentsService.delete(commentId, userId, isAdmin);
  }
}
