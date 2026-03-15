'use client';

import Link from 'next/link';
import { VoteButton } from './VoteButton';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '@/lib/utils';

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

interface PostCardProps {
  post: Post;
  boardSlug: string;
  workspaceSlug: string;
  onVote?: (postId: string) => Promise<void>;
  onUnvote?: (postId: string) => Promise<void>;
}

export function PostCard({ post, boardSlug, workspaceSlug, onVote, onUnvote }: PostCardProps) {
  const postUrl = `/dashboard/${workspaceSlug}/boards/${boardSlug}/${post.id}`;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <VoteButton
        postId={post.id}
        voteCount={post.voteCount}
        hasVoted={!!post.userVote}
        onVote={onVote}
        onUnvote={onUnvote}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={postUrl} className="group">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>
          <StatusBadge status={post.status} />
        </div>

        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium">
              {post.author.name.charAt(0).toUpperCase()}
            </span>
            <span>{post.author.name}</span>
          </div>

          <span>{formatRelativeTime(post.createdAt)}</span>

          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentCount}</span>
          </div>

          {post.category && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: `${post.category.color}20`,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
