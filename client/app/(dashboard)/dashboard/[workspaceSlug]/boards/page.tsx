'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBoards, useCreateBoard } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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

export default function BoardsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const { data: boards, isLoading } = useBoards(workspaceSlug);
  const createBoard = useCreateBoard(workspaceSlug);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(true);
    setFormError('');
  };

  const handleCreateBoard = async () => {
    if (!name.trim()) {
      setFormError('Board name is required');
      return;
    }
    setFormError('');

    try {
      await createBoard.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create board');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading boards...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Boards</h1>
          <p className="text-gray-500">Organize and manage customer feedback</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Create Board</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Board</DialogTitle>
              <DialogDescription>Create a new feedback board for this workspace.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="board-name">Name</Label>
                <Input
                  id="board-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Feature Requests"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="board-description">Description</Label>
                <Textarea
                  id="board-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Share your ideas for new features"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                />
                Public board
              </label>

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
              <Button type="button" onClick={handleCreateBoard} disabled={createBoard.isPending}>
                {createBoard.isPending ? 'Creating...' : 'Create Board'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link key={board.id} href={`/dashboard/${workspaceSlug}/boards/${board.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{board.name}</CardTitle>
                    {board.isPublic ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Public
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <CardDescription>{board.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{board._count?.posts || 0} posts</span>
                    {board.categories?.length > 0 && (
                      <span>{board.categories.length} categories</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium">No boards yet</h3>
            <p className="text-gray-500 mt-1">Create your first feedback board to get started</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Create Board
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
