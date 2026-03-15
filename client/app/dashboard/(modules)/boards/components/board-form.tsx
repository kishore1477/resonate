'use client';

import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { FormGuard } from '@/components/form-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import {
  TwoColumnLayout,
  CustomCard,
  FormInput,
  FormTextarea,
  FormSwitch,
  FormFooter,
} from '@/components/custom';
import { useBoardForm } from '../hooks/useBoardForm';

interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  isLocked: boolean;
  allowAnonymous: boolean;
  requireApproval: boolean;
  showVoteCount: boolean;
  allowComments: boolean;
}

interface BoardFormProps {
  workspaceSlug: string;
  board?: Board | null;
  isReadOnly?: boolean;
}

export default function BoardForm({ workspaceSlug, board, isReadOnly = false }: BoardFormProps) {
  const { methods, onSubmit, onDelete, isSubmitting, isDeleting, isEditing, generateSlug } =
    useBoardForm({
      workspaceSlug,
      board,
    });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    formState: { isDirty },
  } = methods;

  return (
    <FormProvider {...methods}>
      <FormGuard isDirty={isDirty} enabled={!isReadOnly}>
        <form onSubmit={onSubmit}>
          <TwoColumnLayout
            leftContent={
              <>
                <CustomCard heading="Board Details">
                  <div className="space-y-4">
                    <FormInput
                      name="name"
                      label="Board Name"
                      placeholder="Feature Requests"
                      isRequired
                      disabled={isReadOnly}
                    />

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormInput
                          name="slug"
                          label="Board URL"
                          placeholder="feature-requests"
                          isRequired
                          disabled={isReadOnly}
                          prefix={
                            <span className="text-muted-foreground text-sm">/{workspaceSlug}/</span>
                          }
                        />
                      </div>
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateSlug}
                          className="mb-6"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormTextarea
                      name="description"
                      label="Description"
                      placeholder="What kind of feedback should be submitted here?"
                      disabled={isReadOnly}
                      rows={3}
                    />

                    <FormSwitch
                      name="isPublic"
                      label="Public Board"
                      description="Anyone can view and submit feedback"
                      disabled={isReadOnly}
                    />
                  </div>
                </CustomCard>
              </>
            }
            rightContent={
              <>
                {isEditing && (
                  <CustomCard heading="Board Settings">
                    <div className="space-y-4">
                      <FormSwitch
                        name="isLocked"
                        label="Lock Board"
                        description="Prevent new submissions"
                        disabled={isReadOnly}
                      />

                      <FormSwitch
                        name="allowAnonymous"
                        label="Allow Anonymous"
                        description="Users can submit without an account"
                        disabled={isReadOnly}
                      />

                      <FormSwitch
                        name="requireApproval"
                        label="Require Approval"
                        description="Posts need admin approval to be visible"
                        disabled={isReadOnly}
                      />

                      <FormSwitch
                        name="showVoteCount"
                        label="Show Vote Count"
                        description="Display vote counts publicly"
                        disabled={isReadOnly}
                      />

                      <FormSwitch
                        name="allowComments"
                        label="Allow Comments"
                        description="Enable comments on posts"
                        disabled={isReadOnly}
                      />
                    </div>
                  </CustomCard>
                )}

                <CustomCard heading={isEditing ? 'Board Stats' : 'Getting Started'}>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {isEditing ? (
                      <>
                        <div className="flex justify-between">
                          <span>Total Posts</span>
                          <span>24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Open</span>
                          <span>12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipped</span>
                          <span>8</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Votes</span>
                          <span>156</span>
                        </div>
                      </>
                    ) : (
                      <p>
                        Boards are containers for feedback. Create different boards for feature
                        requests, bugs, or different products.
                      </p>
                    )}
                  </div>
                </CustomCard>
              </>
            }
          />

          {!isReadOnly && (
            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              cancelHref={`/dashboard/${workspaceSlug}/boards`}
              submitLabel={isEditing ? 'Save Board' : 'Create Board'}
              showDelete={isEditing}
              onDelete={() => setShowDeleteConfirm(true)}
              isDeleting={isDeleting}
            />
          )}
        </form>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Board"
          description="Are you sure you want to delete this board? All posts will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          isPending={isDeleting}
          onConfirm={() => {
            onDelete();
            setShowDeleteConfirm(false);
          }}
        />
      </FormGuard>
    </FormProvider>
  );
}
