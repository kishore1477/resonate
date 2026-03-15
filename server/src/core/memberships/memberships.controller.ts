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
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole, Workspace, Membership } from '@prisma/client';

interface RequestWithWorkspace extends Request {
  workspace: Workspace;
  membership: Membership;
}

@ApiTags('memberships')
@ApiBearerAuth()
@Controller('workspaces/:slug/members')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all workspace members' })
  async findAll(@Req() req: RequestWithWorkspace) {
    return this.membershipsService.findAll(req.workspace.id);
  }

  @Post('invite')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Invite a user to workspace' })
  async invite(
    @Req() req: RequestWithWorkspace,
    @CurrentUser('id') userId: string,
    @Body() body: { email: string; role?: MemberRole },
  ) {
    return this.membershipsService.invite(
      req.workspace.id,
      userId,
      body.email,
      body.role,
    );
  }

  @Patch(':userId/role')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update member role' })
  async updateRole(
    @Req() req: RequestWithWorkspace,
    @Param('userId') targetUserId: string,
    @Body() body: { role: MemberRole },
  ) {
    return this.membershipsService.updateRole(
      req.workspace.id,
      targetUserId,
      body.role,
      req.membership.role,
    );
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove member or leave workspace' })
  async remove(
    @Req() req: RequestWithWorkspace,
    @CurrentUser('id') currentUserId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.membershipsService.remove(
      req.workspace.id,
      targetUserId,
      currentUserId,
    );
  }
}
