import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for current user' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAllForUser(userId);
  }

  @Get(':slug')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get workspace by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.workspacesService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update workspace' })
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const workspace = await this.workspacesService.findBySlug(slug);
    return this.workspacesService.update(workspace.id, dto);
  }

  @Delete(':slug')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @RequireRole(MemberRole.OWNER)
  @ApiOperation({ summary: 'Delete workspace' })
  async delete(@Param('slug') slug: string) {
    const workspace = await this.workspacesService.findBySlug(slug);
    return this.workspacesService.delete(workspace.id);
  }
}
