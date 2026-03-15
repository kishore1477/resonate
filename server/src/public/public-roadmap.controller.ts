import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { RoadmapService } from '../core/roadmap/roadmap.service';

@ApiTags('public')
@Controller('public/:workspaceSlug/roadmap')
export class PublicRoadmapController {
  constructor(
    private prisma: PrismaService,
    private roadmapService: RoadmapService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get public roadmap' })
  async getRoadmap(@Param('workspaceSlug') workspaceSlug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug, deletedAt: null },
    });

    if (!workspace) {
      return [];
    }

    return this.roadmapService.getRoadmap(workspace.id);
  }
}
