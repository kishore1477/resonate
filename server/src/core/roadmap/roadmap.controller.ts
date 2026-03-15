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
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole, Workspace } from '@prisma/client';

interface RequestWithWorkspace extends Request {
  workspace: Workspace;
}

@ApiTags('roadmap')
@ApiBearerAuth()
@Controller('workspaces/:slug/roadmap')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) { }

  @Get()
  @ApiOperation({ summary: 'Get workspace roadmap' })
  async getRoadmap(@Req() req: RequestWithWorkspace) {
    return this.roadmapService.getRoadmap(req.workspace.id);
  }

  @Post('items')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Add post to roadmap' })
  async addToRoadmap(
    @Body() body: { postId: string; column: string; eta?: string },
  ) {
    return this.roadmapService.addToRoadmap(
      body.postId,
      body.column,
      body.eta ? new Date(body.eta) : undefined,
    );
  }

  @Patch('items/:itemId')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Move roadmap item' })
  async moveItem(
    @Param('itemId') itemId: string,
    @Body() body: { column: string; order: number },
  ) {
    return this.roadmapService.moveItem(itemId, body.column, body.order);
  }

  @Delete('posts/:postId')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Remove post from roadmap' })
  async removeFromRoadmap(@Param('postId') postId: string) {
    return this.roadmapService.removeFromRoadmap(postId);
  }
}
