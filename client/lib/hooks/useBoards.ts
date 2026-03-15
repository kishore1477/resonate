'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  isLocked: boolean;
  _count: {
    posts: number;
  };
  categories: {
    id: string;
    name: string;
    color: string;
  }[];
}

export function useBoards(workspaceSlug: string) {
  return useQuery<Board[]>({
    queryKey: ['boards', workspaceSlug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/boards`);
      return (res as any).data || res;
    },
    enabled: !!workspaceSlug,
  });
}

export function useBoard(workspaceSlug: string, boardSlug: string) {
  return useQuery<Board>({
    queryKey: ['board', workspaceSlug, boardSlug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/boards/${boardSlug}`);
      return (res as any).data || res;
    },
    enabled: !!workspaceSlug && !!boardSlug,
  });
}

export function useCreateBoard(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic?: boolean }) =>
      apiFetch(`/workspaces/${workspaceSlug}/boards`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceSlug] });
    },
  });
}
