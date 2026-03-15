'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

const roleColors = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
  VIEWER: 'outline',
} as const;

export default function MembersSettingsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Member['role']>('MEMBER');
  const [formError, setFormError] = useState('');

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['members', workspaceSlug],
    queryFn: async () => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/members`);
      return (res as any).data || res;
    },
  });

  const inviteMember = useMutation({
    mutationFn: async (data: { email: string; role: Member['role'] }) => {
      const res = await apiFetch(`/workspaces/${workspaceSlug}/members/invite`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return (res as any).data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceSlug] });
    },
  });

  const resetForm = () => {
    setEmail('');
    setRole('MEMBER');
    setFormError('');
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    setFormError('');

    try {
      await inviteMember.mutateAsync({ email: email.trim(), role });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to invite member');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading members...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-500">Manage who has access to this workspace</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>Send an invitation to join this workspace.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Member['role'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
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
              <Button type="button" onClick={handleInvite} disabled={inviteMember.isPending}>
                {inviteMember.isPending ? 'Inviting...' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500">Member</th>
                <th className="text-left p-4 font-medium text-gray-500">Role</th>
                <th className="text-left p-4 font-medium text-gray-500">Joined</th>
                <th className="text-right p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members?.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={roleColors[member.role]}>{member.role}</Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="p-4 text-right">
                    {member.role !== 'OWNER' && (
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
