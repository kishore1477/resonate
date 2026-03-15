'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '@/lib/validations';
import { apiFetch } from '@/lib/api/client';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  accentColor?: string;
}

interface UseWorkspaceFormOptions {
  workspace?: Workspace | null;
  onSuccess?: (workspace: Workspace) => void;
}

export function useWorkspaceForm({ workspace, onSuccess }: UseWorkspaceFormOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!workspace;

  const methods = useForm<CreateWorkspaceInput | UpdateWorkspaceInput>({
    resolver: zodResolver(isEditing ? updateWorkspaceSchema : createWorkspaceSchema),
    mode: 'onBlur',
    defaultValues: {
      name: workspace?.name ?? '',
      slug: workspace?.slug ?? '',
      description: workspace?.description ?? '',
      ...(isEditing && {
        logo: workspace?.logo ?? '',
        primaryColor: workspace?.primaryColor ?? '#6366f1',
        accentColor: workspace?.accentColor ?? '#8b5cf6',
      }),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const res = await apiFetch('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res as Workspace;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully');
      onSuccess?.(workspace);
      router.push(`/dashboard/${workspace.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create workspace');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateWorkspaceInput) => {
      const res = await apiFetch(`/workspaces/${workspace!.slug}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res as Workspace;
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace!.slug] });
      toast.success('Workspace updated successfully');
      onSuccess?.(updatedWorkspace);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update workspace');
    },
  });

  const onSubmit = methods.handleSubmit((data) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateWorkspaceInput);
    } else {
      createMutation.mutate(data as CreateWorkspaceInput);
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
    isSubmitting,
    isEditing,
    generateSlug,
  };
}
