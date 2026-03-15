import { z } from 'zod';

// =============================================================================
// REUSABLE FIELD TYPES
// =============================================================================

export const optionalString = z.string().optional();
export const requiredString = z.string().min(1, 'This field is required');
export const shortText = z.string().max(100).optional();
export const mediumText = z.string().max(255).optional();
export const longText = z.string().max(1000).optional();

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(50)
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
  .optional();

export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

export const zodEmailSchema = z.string().email('Invalid email').max(100);

// =============================================================================
// WORKSPACE SCHEMAS
// =============================================================================

export const createWorkspaceSchema = z.object({
  name: requiredString.max(100, 'Name must be 100 characters or less'),
  slug: slugSchema,
  description: mediumText,
});

export const updateWorkspaceSchema = createWorkspaceSchema.extend({
  logo: urlSchema,
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

// =============================================================================
// BOARD SCHEMAS
// =============================================================================

export const createBoardSchema = z.object({
  name: requiredString.max(100),
  slug: slugSchema,
  description: mediumText,
  isPublic: z.boolean().default(true),
});

export const updateBoardSchema = createBoardSchema.extend({
  isLocked: z.boolean().optional(),
  allowAnonymous: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  showVoteCount: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

// =============================================================================
// POST SCHEMAS
// =============================================================================

export const postStatusSchema = z.enum([
  'OPEN',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_PROGRESS',
  'SHIPPED',
  'CLOSED',
]);

export const createPostSchema = z.object({
  title: requiredString.max(200, 'Title must be 200 characters or less'),
  content: requiredString.max(10000, 'Content must be 10000 characters or less'),
  categoryId: optionalString,
});

export const updatePostSchema = createPostSchema.extend({
  status: postStatusSchema.optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// =============================================================================
// CHANGELOG SCHEMAS
// =============================================================================

export const createChangelogSchema = z.object({
  title: requiredString.max(200),
  content: requiredString.max(50000),
  excerpt: mediumText,
  coverImage: urlSchema,
  linkedPostIds: z.array(z.string()).optional(),
});

export const updateChangelogSchema = createChangelogSchema.partial();

export type CreateChangelogInput = z.infer<typeof createChangelogSchema>;
export type UpdateChangelogInput = z.infer<typeof updateChangelogSchema>;

// =============================================================================
// MEMBER SCHEMAS
// =============================================================================

export const memberRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

export const inviteMemberSchema = z.object({
  email: zodEmailSchema,
  role: memberRoleSchema.default('MEMBER'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
