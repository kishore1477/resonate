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
import { ChangelogService } from './changelog.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole, Workspace } from '@prisma/client';

interface RequestWithWorkspace extends Request {
  workspace: Workspace;
}

@ApiTags('changelog')
@ApiBearerAuth()
@Controller('workspaces/:slug/changelog')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) { }

  @Post()
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a changelog entry' })
  async create(
    @Req() req: RequestWithWorkspace,
    @Body() body: {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      linkedPostIds?: string[];
    },
  ) {
    return this.changelogService.create(req.workspace.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all changelogs' })
  async findAll(@Req() req: RequestWithWorkspace) {
    return this.changelogService.findAll(req.workspace.id, true);
  }

  @Get(':changelogSlug')
  @ApiOperation({ summary: 'Get changelog by slug' })
  async findOne(
    @Req() req: RequestWithWorkspace,
    @Param('changelogSlug') changelogSlug: string,
  ) {
    return this.changelogService.findBySlug(req.workspace.id, changelogSlug);
  }

  @Patch(':changelogSlug')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update changelog' })
  async update(
    @Req() req: RequestWithWorkspace,
    @Param('changelogSlug') changelogSlug: string,
    @Body() body: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      linkedPostIds?: string[];
    },
  ) {
    const changelog = await this.changelogService.findBySlug(
      req.workspace.id,
      changelogSlug,
    );
    return this.changelogService.update(changelog.id, body);
  }

  @Post(':changelogSlug/publish')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Publish changelog' })
  async publish(
    @Req() req: RequestWithWorkspace,
    @Param('changelogSlug') changelogSlug: string,
  ) {
    const changelog = await this.changelogService.findBySlug(
      req.workspace.id,
      changelogSlug,
    );
    return this.changelogService.publish(changelog.id);
  }

  @Post(':changelogSlug/unpublish')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Unpublish changelog' })
  async unpublish(
    @Req() req: RequestWithWorkspace,
    @Param('changelogSlug') changelogSlug: string,
  ) {
    const changelog = await this.changelogService.findBySlug(
      req.workspace.id,
      changelogSlug,
    );
    return this.changelogService.unpublish(changelog.id);
  }

  @Delete(':changelogSlug')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.OWNER)
  @ApiOperation({ summary: 'Delete changelog' })
  async delete(
    @Req() req: RequestWithWorkspace,
    @Param('changelogSlug') changelogSlug: string,
  ) {
    const changelog = await this.changelogService.findBySlug(
      req.workspace.id,
      changelogSlug,
    );
    return this.changelogService.delete(changelog.id);
  }
}
