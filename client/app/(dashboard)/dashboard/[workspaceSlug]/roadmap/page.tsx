'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RoadmapColumn {
  id: string;
  title: string;
  items: {
    id: string;
    postId: string;
    title: string;
    excerpt: string;
    voteCount: number;
    category?: {
      name: string;
      color: string;
    };
  }[];
}

export default function RoadmapPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const [column, setColumn] = useState<'planned' | 'in_progress' | 'shipped'>('planned');
  const [formError, setFormError] = useState('');

  const { data: columns, isLoading } = useQuery<RoadmapColumn[]>({
    queryKey: ['roadmap', workspaceSlug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/roadmap`);
      return (res as any).data || res;
    },
  });

  const addRoadmapItem = useMutation({
    mutationFn: async (data: { postId: string; column: 'planned' | 'in_progress' | 'shipped' }) => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/roadmap/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return (res as any).data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', workspaceSlug] });
    },
  });

  const resetForm = () => {
    setPostId('');
    setColumn('planned');
    setFormError('');
  };

  const handleAddRoadmapItem = async () => {
    if (!postId.trim()) {
      setFormError('Post ID is required');
      return;
    }
    setFormError('');

    try {
      await addRoadmapItem.mutateAsync({ postId: postId.trim(), column });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create roadmap item');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading roadmap...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Roadmap</h1>
            <p className="text-gray-500">Track feature progress and upcoming releases</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Roadmap Item</DialogTitle>
                <DialogDescription>Add an existing post to the roadmap.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roadmap-post-id">Post ID</Label>
                  <Input
                    id="roadmap-post-id"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    placeholder="Enter the post ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roadmap-column">Column</Label>
                  <select
                    id="roadmap-column"
                    value={column}
                    onChange={(e) =>
                      setColumn(e.target.value as 'planned' | 'in_progress' | 'shipped')
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="shipped">Shipped</option>
                  </select>
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
                <Button
                  type="button"
                  onClick={handleAddRoadmapItem}
                  disabled={addRoadmapItem.isPending}
                >
                  {addRoadmapItem.isPending ? 'Adding...' : 'Add Item'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns?.map((col) => (
          <div key={col.id} className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {col.title}
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {col.items.length}
              </span>
            </h2>

            <div className="space-y-3">
              {col.items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No items</p>
              ) : (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        {item.voteCount}
                      </span>
                      {item.category && (
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${item.category.color}20`,
                            color: item.category.color,
                          }}
                        >
                          {item.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
