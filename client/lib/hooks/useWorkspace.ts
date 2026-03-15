'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  plan: string;
  role: string;
  createdAt: string;
}

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await apiFetch('/workspaces');
      return (res as any).data || res;
    },
  });
}

export function useWorkspace(slug: string) {
  return useQuery<Workspace>({
    queryKey: ['workspace', slug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${slug}`);
      return (res as any).data || res;
    },
    enabled: !!slug,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiFetch('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
