'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createBoardSchema, updateBoardSchema, CreateBoardInput, UpdateBoardInput } from '@/lib/validations';
import { apiFetch } from '@/lib/api/client';

interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  isLocked: boolean;
  allowAnonymous: boolean;
  requireApproval: boolean;
  showVoteCount: boolean;
  allowComments: boolean;
}

interface UseBoardFormOptions {
  workspaceSlug: string;
  board?: Board | null;
  onSuccess?: (board: Board) => void;
}

export function useBoardForm({ workspaceSlug, board, onSuccess }: UseBoardFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!board;

  const methods = useForm<CreateBoardInput | UpdateBoardInput>({
    resolver: zodResolver(isEditing ? updateBoardSchema : createBoardSchema),
    mode: 'onBlur',
    defaultValues: {
      name: board?.name ?? '',
      slug: board?.slug ?? '',
      description: board?.description ?? '',
      isPublic: board?.isPublic ?? true,
      ...(isEditing && {
        isLocked: board?.isLocked ?? false,
        allowAnonymous: board?.allowAnonymous ?? false,
        requireApproval: board?.requireApproval ?? false,
        showVoteCount: board?.showVoteCount ?? true,
        allowComments: board?.allowComments ?? true,
      }),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateBoardInput) => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/boards`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res as Board;
    },
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceSlug] });
      toast.success('Board created successfully');
      onSuccess?.(newBoard);
      router.push(`/dashboard/${workspaceSlug}/boards/${newBoard.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create board');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBoardInput) => {
      const res = await apiFetch(`/boards/${board!.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res as Board;
    },
    onSuccess: (updatedBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceSlug] });
      queryClient.invalidateQueries({ queryKey: ['board', board!.id] });
      toast.success('Board updated successfully');
      onSuccess?.(updatedBoard);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update board');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/boards/${board!.id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceSlug] });
      toast.success('Board deleted successfully');
      router.push(`/dashboard/${workspaceSlug}/boards`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete board');
    },
  });

  const onSubmit = methods.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateBoardInput);
    } else {
      createMutation.mutate(data as CreateBoardInput);
    }
  });

  const onDelete = () => {
    deleteMutation.mutate();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Auto-generate slug from name
  const watchName = methods.watch('name');
  const generateSlug = () => {
    const slug = watchName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    methods.setValue('slug', slug, { shouldValidate: true });
  };

  return {
    methods,
    onSubmit,
    onDelete,
    isSubmitting,
    isDeleting,
    isEditing,
    generateSlug,
  };
}
