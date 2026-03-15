'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  voteCount: number;
  commentCount: number;
  userVote: number | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface PostsResponse {
  data: Post[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

interface QueryParams {
  search?: string;
  status?: string;
  categoryId?: string;
  sort?: 'newest' | 'oldest' | 'votes' | 'comments';
  skip?: number;
  take?: number;
}

export function usePosts(boardId: string, params: QueryParams = {}) {
  return useQuery<PostsResponse>({
    queryKey: ['posts', boardId, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') query.set(key, String(value));
      });
      const res = await apiFetch(`/boards/${boardId}/posts?${query}`);
      return res as PostsResponse;
    },
    enabled: !!boardId,
  });
}

export function usePost(postId: string) {
  return useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const res = await apiFetch(`/posts/${postId}`);
      return (res as any).data || res;
    },
    enabled: !!postId,
  });
}

export function useCreatePost(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string; categoryId?: string }) =>
      apiFetch(`/boards/${boardId}/posts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', boardId] });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (postId: string) =>
      apiFetch(`/posts/${postId}/votes`, { method: 'POST' }),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: (postId: string) =>
      apiFetch(`/posts/${postId}/votes`, { method: 'DELETE' }),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    vote: voteMutation.mutateAsync,
    unvote: unvoteMutation.mutateAsync,
    isVoting: voteMutation.isPending || unvoteMutation.isPending,
  };
}
