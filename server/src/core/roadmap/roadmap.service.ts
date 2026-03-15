import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface RoadmapColumn {
  id: string;
  title: string;
  items: any[];
}

@Injectable()
export class RoadmapService {
  private readonly DEFAULT_COLUMNS = ['planned', 'in_progress', 'shipped'];

  constructor(private prisma: PrismaService) { }

  /**
   * Get roadmap for a workspace
   */
  async getRoadmap(workspaceId: string): Promise<RoadmapColumn[]> {
    const roadmapItems = await this.prisma.roadmapItem.findMany({
      where: {
        post: {
          board: { workspaceId },
          deletedAt: null,
        },
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            voteCount: true,
            category: {
              select: { id: true, name: true, color: true },
            },
            board: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Group by column
    const columnMap = new Map<string, any[]>();
    this.DEFAULT_COLUMNS.forEach((col) => columnMap.set(col, []));

    for (const item of roadmapItems) {
      const column = columnMap.get(item.column) || [];
      column.push({
        id: item.id,
        postId: item.post.id,
        title: item.post.title,
        excerpt: item.post.content.slice(0, 150),
        voteCount: item.post.voteCount,
        status: item.post.status,
        category: item.post.category,
        board: item.post.board,
        eta: item.eta,
        order: item.order,
      });
      columnMap.set(item.column, column);
    }

    return this.DEFAULT_COLUMNS.map((colId) => ({
      id: colId,
      title: this.getColumnTitle(colId),
      items: columnMap.get(colId) || [],
    }));
  }

  /**
   * Add post to roadmap
   */
  async addToRoadmap(postId: string, column: string, eta?: Date) {
    // Remove existing roadmap item if exists
    await this.prisma.roadmapItem.deleteMany({
      where: { postId },
    });

    // Get next order
    const lastItem = await this.prisma.roadmapItem.findFirst({
      where: { column },
      orderBy: { order: 'desc' },
    });

    const roadmapItem = await this.prisma.roadmapItem.create({
      data: {
        postId,
        column,
        eta,
        order: (lastItem?.order ?? -1) + 1,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            voteCount: true,
          },
        },
      },
    });

    return roadmapItem;
  }

  /**
   * Move roadmap item to different column or position
   */
  async moveItem(itemId: string, column: string, order: number) {
    const item = await this.prisma.roadmapItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Roadmap item not found');
    }

    // Reorder items in target column
    await this.prisma.roadmapItem.updateMany({
      where: {
        column,
        order: { gte: order },
      },
      data: {
        order: { increment: 1 },
      },
    });

    return this.prisma.roadmapItem.update({
      where: { id: itemId },
      data: { column, order },
    });
  }

  /**
   * Remove post from roadmap
   */
  async removeFromRoadmap(postId: string) {
    await this.prisma.roadmapItem.deleteMany({
      where: { postId },
    });
    return { success: true };
  }

  private getColumnTitle(column: string): string {
    const titles: Record<string, string> = {
      planned: 'Planned',
      in_progress: 'In Progress',
      shipped: 'Shipped',
    };
    return titles[column] || column;
  }
}
