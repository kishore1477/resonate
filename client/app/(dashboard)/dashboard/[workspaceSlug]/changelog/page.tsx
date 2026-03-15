'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { formatDate } from '@/lib/utils';

interface Changelog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
}

export default function ChangelogPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [formError, setFormError] = useState('');

  const { data: changelogs, isLoading } = useQuery<Changelog[]>({
    queryKey: ['changelogs', workspaceSlug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/changelog`);
      return (res as any).data || res;
    },
  });

  const createChangelog = useMutation({
    mutationFn: async (data: { title: string; content: string; excerpt?: string }) => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/changelog`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return (res as any).data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelogs', workspaceSlug] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setExcerpt('');
    setFormError('');
  };

  const handleCreateEntry = async () => {
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!content.trim()) {
      setFormError('Content is required');
      return;
    }
    setFormError('');

    try {
      await createChangelog.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create entry');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading changelogs...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Changelog</h1>
          <p className="text-gray-500">Announce releases and keep users informed</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>New Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Changelog Entry</DialogTitle>
              <DialogDescription>
                Create a new changelog entry to announce a release.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="changelog-title">Title</Label>
                <Input
                  id="changelog-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. v2.0 Release"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="changelog-excerpt">Excerpt</Label>
                <Input
                  id="changelog-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of this release"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="changelog-content">Content</Label>
                <Textarea
                  id="changelog-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe what's new in this release..."
                  rows={6}
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
              <Button
                type="button"
                onClick={handleCreateEntry}
                disabled={createChangelog.isPending}
              >
                {createChangelog.isPending ? 'Creating...' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {changelogs && changelogs.length > 0 ? (
        <div className="space-y-4">
          {changelogs.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    {entry.excerpt && (
                      <CardDescription className="mt-1">{entry.excerpt}</CardDescription>
                    )}
                  </div>
                  <Badge variant={entry.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                    {entry.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {entry.publishedAt && <span>Published {formatDate(entry.publishedAt)}</span>}
                  <span>Created {formatDate(entry.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-lg font-medium">No changelog entries yet</h3>
            <p className="text-gray-500 mt-1">Create your first entry to announce a release</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Create Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
