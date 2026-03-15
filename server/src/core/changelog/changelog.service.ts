import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ChangelogStatus } from '@prisma/client';

@Injectable()
export class ChangelogService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new changelog entry
   */
  async create(
    workspaceId: string,
    data: {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      linkedPostIds?: string[];
    },
  ) {
    const slug = slugify(data.title, { lower: true, strict: true });

    // Check for existing slug
    const existing = await this.prisma.changelog.findUnique({
      where: { workspaceId_slug: { workspaceId, slug } },
    });

    if (existing) {
      throw new ConflictException('A changelog with this title already exists');
    }

    return this.prisma.changelog.create({
      data: {
        workspaceId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        linkedPostIds: data.linkedPostIds || [],
      },
    });
  }

  /**
   * Get all changelogs for a workspace
   */
  async findAll(workspaceId: string, includeUnpublished = false) {
    const where: any = { workspaceId };

    if (!includeUnpublished) {
      where.status = ChangelogStatus.PUBLISHED;
    }

    return this.prisma.changelog.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  }

  /**
   * Get changelog by slug
   */
  async findBySlug(workspaceId: string, slug: string) {
    const changelog = await this.prisma.changelog.findUnique({
      where: { workspaceId_slug: { workspaceId, slug } },
    });

    if (!changelog) {
      throw new NotFoundException('Changelog not found');
    }

    return changelog;
  }

  /**
   * Update changelog
   */
  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string;
      linkedPostIds?: string[];
    },
  ) {
    return this.prisma.changelog.update({
      where: { id },
      data,
    });
  }

  /**
   * Publish changelog
   */
  async publish(id: string) {
    const changelog = await this.prisma.changelog.update({
      where: { id },
      data: {
        status: ChangelogStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Update linked posts to SHIPPED status
    if (changelog.linkedPostIds.length > 0) {
      await this.prisma.post.updateMany({
        where: { id: { in: changelog.linkedPostIds } },
        data: { status: 'SHIPPED' },
      });
    }

    // TODO: Send email notifications to subscribers

    return changelog;
  }

  /**
   * Unpublish changelog
   */
  async unpublish(id: string) {
    return this.prisma.changelog.update({
      where: { id },
      data: {
        status: ChangelogStatus.DRAFT,
        publishedAt: null,
      },
    });
  }

  /**
   * Delete changelog
   */
  async delete(id: string) {
    await this.prisma.changelog.delete({
      where: { id },
    });
    return { success: true };
  }

  /**
   * Subscribe to changelog updates
   */
  async subscribe(workspaceId: string, email: string) {
    const existing = await this.prisma.changelogSubscriber.findUnique({
      where: { workspaceId_email: { workspaceId, email } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.changelogSubscriber.create({
      data: { workspaceId, email },
    });
  }

  /**
   * Unsubscribe from changelog updates
   */
  async unsubscribe(workspaceId: string, email: string) {
    await this.prisma.changelogSubscriber.deleteMany({
      where: { workspaceId, email },
    });
    return { success: true };
  }
}
