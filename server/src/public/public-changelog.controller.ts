import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ChangelogService } from '../core/changelog/changelog.service';

@ApiTags('public')
@Controller('public/:workspaceSlug/changelog')
export class PublicChangelogController {
  constructor(
    private prisma: PrismaService,
    private changelogService: ChangelogService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get public changelogs' })
  async getChangelogs(@Param('workspaceSlug') workspaceSlug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug, deletedAt: null },
    });

    if (!workspace) {
      return [];
    }

    return this.changelogService.findAll(workspace.id, false);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get changelog by slug' })
  async getChangelog(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('slug') slug: string,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug, deletedAt: null },
    });

    if (!workspace) {
      return null;
    }

    return this.changelogService.findBySlug(workspace.id, slug);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to changelog updates' })
  async subscribe(
    @Param('workspaceSlug') workspaceSlug: string,
    @Body() body: { email: string },
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return { success: false };
    }

    return this.changelogService.subscribe(workspace.id, body.email);
  }

  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from changelog updates' })
  async unsubscribe(
    @Param('workspaceSlug') workspaceSlug: string,
    @Body() body: { email: string },
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return { success: false };
    }

    return this.changelogService.unsubscribe(workspace.id, body.email);
  }
}
