import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new board
   */
  async create(workspaceId: string, dto: CreateBoardDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    // Check for existing slug in workspace
    const existing = await this.prisma.board.findUnique({
      where: {
        workspaceId_slug: { workspaceId, slug },
      },
    });

    if (existing) {
      throw new ConflictException('A board with this name already exists');
    }

    return this.prisma.board.create({
      data: {
        workspaceId,
        name: dto.name,
        slug,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
      },
    });
  }

  /**
   * Get all boards for a workspace
   */
  async findAll(workspaceId: string) {
    return this.prisma.board.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        _count: {
          select: {
            posts: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get board by ID
   */
  async findById(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id, deletedAt: null },
      include: {
        categories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  /**
   * Get board by slug within workspace
   */
  async findBySlug(workspaceId: string, slug: string) {
    const board = await this.prisma.board.findUnique({
      where: {
        workspaceId_slug: { workspaceId, slug },
        deletedAt: null,
      },
      include: {
        categories: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            posts: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  /**
   * Update board
   */
  async update(id: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Soft delete board
   */
  async delete(id: string) {
    return this.prisma.board.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
