import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: MemberRole[]) =>
  SetMetadata(ROLES_KEY, roles);
