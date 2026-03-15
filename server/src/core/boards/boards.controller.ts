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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../auth/guards/workspace-member.guard';
import { WorkspaceRoleGuard } from '../../auth/guards/workspace-role.guard';
import { RequireRole } from '../../auth/decorators/require-role.decorator';
import { MemberRole, Workspace } from '@prisma/client';

interface RequestWithWorkspace extends Request {
  workspace: Workspace;
}

@ApiTags('boards')
@ApiBearerAuth()
@Controller('workspaces/:slug/boards')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Post()
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a new board' })
  async create(
    @Req() req: RequestWithWorkspace,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.create(req.workspace.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards in workspace' })
  async findAll(@Req() req: RequestWithWorkspace) {
    return this.boardsService.findAll(req.workspace.id);
  }

  @Get(':boardSlug')
  @ApiOperation({ summary: 'Get board by slug' })
  async findOne(
    @Req() req: RequestWithWorkspace,
    @Param('boardSlug') boardSlug: string,
  ) {
    return this.boardsService.findBySlug(req.workspace.id, boardSlug);
  }

  @Patch(':boardSlug')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update board' })
  async update(
    @Req() req: RequestWithWorkspace,
    @Param('boardSlug') boardSlug: string,
    @Body() dto: UpdateBoardDto,
  ) {
    const board = await this.boardsService.findBySlug(req.workspace.id, boardSlug);
    return this.boardsService.update(board.id, dto);
  }

  @Delete(':boardSlug')
  @UseGuards(WorkspaceRoleGuard)
  @RequireRole(MemberRole.OWNER)
  @ApiOperation({ summary: 'Delete board' })
  async delete(
    @Req() req: RequestWithWorkspace,
    @Param('boardSlug') boardSlug: string,
  ) {
    const board = await this.boardsService.findBySlug(req.workspace.id, boardSlug);
    return this.boardsService.delete(board.id);
  }
}
