'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBoard } from '@/lib/hooks/useBoards';
import { usePosts, useCreatePost, useVote } from '@/lib/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PostList } from '@/components/features/posts/PostList';

export default function BoardPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const boardSlug = params.boardSlug as string;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'newest' | 'votes'>('newest');

  const { data: board, isLoading: boardLoading } = useBoard(workspaceSlug, boardSlug);
  const { data: postsData, isLoading: postsLoading } = usePosts(board?.id || '', {
    search,
    status: status || undefined,
    sort,
  });
  const createPost = useCreatePost(board?.id || '');
  const { vote, unvote } = useVote();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFormError('');
  };

  const handleCreatePost = async () => {
    if (!title.trim()) {
      setFormError('Post title is required');
      return;
    }
    setFormError('');

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  if (boardLoading) {
    return <div className="animate-pulse">Loading board...</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href={`/dashboard/${workspaceSlug}/boards`} className="hover:text-primary">
              Boards
            </Link>
            <span>/</span>
            <span>{board.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          {board.description && <p className="text-gray-500">{board.description}</p>}
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>New Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Post</DialogTitle>
              <DialogDescription>Create a new feedback post in {board.name}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Add dark mode support"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-content">Description</Label>
                <Textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your idea or feedback..."
                  rows={4}
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleCreatePost} disabled={createPost.isPending}>
                {createPost.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SHIPPED">Shipped</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'votes')}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="newest">Newest</option>
          <option value="votes">Most Voted</option>
          <option value="comments">Most Discussed</option>
        </select>
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <PostList
          posts={(postsData?.data || []) as any}
          boardSlug={boardSlug}
          workspaceSlug={workspaceSlug}
          onVote={vote}
          onUnvote={unvote}
        />
      )}

      {/* Pagination */}
      {postsData && postsData.meta.total > postsData.meta.take && (
        <div className="mt-6 flex justify-center">
          <p className="text-sm text-gray-500">
            Showing {postsData.data.length} of {postsData.meta.total} posts
          </p>
        </div>
      )}
    </div>
  );
}
