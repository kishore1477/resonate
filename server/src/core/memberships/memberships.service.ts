import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get all members of a workspace
   */
  async findAll(workspaceId: string) {
    return this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });
  }

  /**
   * Invite a user to workspace
   */
  async invite(
    workspaceId: string,
    invitedByUserId: string,
    email: string,
    role: MemberRole = MemberRole.MEMBER,
  ) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found. They need to register first.');
    }

    // Check if already a member
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member');
    }

    // Create membership
    return this.prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        invitedBy: invitedByUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Update member role
   */
  async updateRole(
    workspaceId: string,
    targetUserId: string,
    newRole: MemberRole,
    currentUserRole: MemberRole,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    // Cannot change owner role unless you're the owner
    if (membership.role === MemberRole.OWNER && currentUserRole !== MemberRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Cannot promote to owner unless you're the owner
    if (newRole === MemberRole.OWNER && currentUserRole !== MemberRole.OWNER) {
      throw new ForbiddenException('Cannot promote to owner');
    }

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Remove member from workspace
   */
  async remove(workspaceId: string, targetUserId: string, currentUserId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove owner
    if (membership.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove workspace owner');
    }

    // Users can leave themselves
    if (targetUserId !== currentUserId) {
      // Get current user's membership to check permission
      const currentMembership = await this.prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: currentUserId,
            workspaceId,
          },
        },
      });

      if (!currentMembership ||
        (currentMembership.role !== MemberRole.OWNER &&
          currentMembership.role !== MemberRole.ADMIN)) {
        throw new ForbiddenException('Insufficient permissions to remove members');
      }
    }

    await this.prisma.membership.delete({
      where: { id: membership.id },
    });

    return { success: true };
  }
}
