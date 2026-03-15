'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  postId: string;
  voteCount: number;
  hasVoted: boolean;
  onVote?: (postId: string) => Promise<void>;
  onUnvote?: (postId: string) => Promise<void>;
}

export function VoteButton({
  postId,
  voteCount: initialCount,
  hasVoted: initialHasVoted,
  onVote,
  onUnvote,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (hasVoted) {
        // Optimistic update
        setVoteCount((v) => v - 1);
        setHasVoted(false);
        await onUnvote?.(postId);
      } else {
        // Optimistic update
        setVoteCount((v) => v + 1);
        setHasVoted(true);
        await onVote?.(postId);
      }
    } catch {
      // Revert on error
      if (hasVoted) {
        setVoteCount((v) => v + 1);
        setHasVoted(true);
      } else {
        setVoteCount((v) => v - 1);
        setHasVoted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'flex flex-col items-center justify-center w-14 h-16 rounded-lg border transition-colors',
        hasVoted
          ? 'bg-primary/10 border-primary text-primary'
          : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <svg
        className="w-4 h-4"
        fill={hasVoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
      <span className="text-sm font-semibold mt-1">{voteCount}</span>
    </button>
  );
}
