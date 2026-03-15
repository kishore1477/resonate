'use client';

import { PostCard } from './PostCard';

interface Post {
  id: string;
  title: string;
  content: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'SHIPPED' | 'CLOSED';
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

interface PostListProps {
  posts: Post[];
  boardSlug: string;
  workspaceSlug: string;
  onVote?: (postId: string) => Promise<void>;
  onUnvote?: (postId: string) => Promise<void>;
}

export function PostList({ posts, boardSlug, workspaceSlug, onVote, onUnvote }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
        <p className="mt-1 text-gray-500">Be the first to submit a feature request!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          boardSlug={boardSlug}
          workspaceSlug={workspaceSlug}
          onVote={onVote}
          onUnvote={onUnvote}
        />
      ))}
    </div>
  );
}
