import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get workspace slug from params or header
    const workspaceSlug =
      request.params.workspaceSlug ||
      request.params.slug ||
      request.headers['x-workspace-slug'];

    if (!workspaceSlug) {
      throw new ForbiddenException('Workspace not specified');
    }

    // Find workspace and membership
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: workspaceSlug, deletedAt: null },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this workspace');
    }

    // Attach workspace and membership to request for later use
    request.workspace = workspace;
    request.membership = membership;

    return true;
  }
}
