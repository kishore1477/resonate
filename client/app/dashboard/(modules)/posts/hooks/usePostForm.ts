'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPostSchema, updatePostSchema, CreatePostInput, UpdatePostInput } from '@/lib/validations';
import { apiFetch } from '@/lib/api/client';

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  categoryId?: string;
  isPinned: boolean;
  isLocked: boolean;
}

interface UsePostFormOptions {
  boardId: string;
  workspaceSlug: string;
  boardSlug: string;
  post?: Post | null;
  onSuccess?: () => void;
}

export function usePostForm({
  boardId,
  workspaceSlug,
  boardSlug,
  post,
  onSuccess,
}: UsePostFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!post;

  const methods = useForm<CreatePostInput | UpdatePostInput>({
    resolver: zodResolver(isEditing ? updatePostSchema : createPostSchema),
    mode: 'onBlur',
    defaultValues: {
      title: post?.title ?? '',
      content: post?.content ?? '',
      categoryId: post?.categoryId ?? '',
      ...(isEditing && {
        status: post?.status as any,
        isPinned: post?.isPinned ?? false,
        isLocked: post?.isLocked ?? false,
      }),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      return apiFetch(`/boards/${boardId}/posts`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', boardId] });
      toast.success('Post created successfully');
      onSuccess?.();
      router.push(`/dashboard/${workspaceSlug}/boards/${boardSlug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePostInput) => {
      return apiFetch(`/posts/${post!.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', boardId] });
      queryClient.invalidateQueries({ queryKey: ['post', post!.id] });
      toast.success('Post updated successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/posts/${post!.id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', boardId] });
      toast.success('Post deleted successfully');
      router.push(`/dashboard/${workspaceSlug}/boards/${boardSlug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  const onSubmit = methods.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdatePostInput);
    } else {
      createMutation.mutate(data as CreatePostInput);
    }
  });

  const onDelete = () => {
    deleteMutation.mutate();
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return {
    methods,
    onSubmit,
    onDelete,
    isSubmitting,
    isDeleting,
    isEditing,
  };
}
