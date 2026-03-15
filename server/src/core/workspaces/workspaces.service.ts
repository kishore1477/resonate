import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { MemberRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new workspace
   */
  async create(userId: string, dto: CreateWorkspaceDto) {
    // Generate unique slug
    let slug = slugify(dto.name, { lower: true, strict: true });
    const existingSlug = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create workspace and add creator as owner
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        memberships: {
          create: {
            userId,
            role: MemberRole.OWNER,
            joinedAt: new Date(),
          },
        },
      },
      include: {
        memberships: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    return workspace;
  }

  /**
   * Get all workspaces for a user
   */
  async findAllForUser(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            plan: true,
            createdAt: true,
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  /**
   * Get workspace by slug
   */
  async findBySlug(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug, deletedAt: null },
      include: {
        _count: {
          select: {
            memberships: true,
            boards: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  /**
   * Update workspace
   */
  async update(id: string, dto: UpdateWorkspaceDto) {
    // Check slug uniqueness if updating
    if (dto.slug) {
      const existingSlug = await this.prisma.workspace.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        throw new ConflictException('Slug already taken');
      }
    }

    return this.prisma.workspace.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Soft delete workspace
   */
  async delete(id: string) {
    return this.prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
