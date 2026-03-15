'use client';

import { useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { FormGuard } from '@/components/form-guard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  TwoColumnLayout,
  CustomCard,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSwitch,
  FormFooter,
  ConditionalFieldWrapper,
} from '@/components/custom';
import { usePostForm } from '../hooks/usePostForm';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  categoryId?: string;
  isPinned: boolean;
  isLocked: boolean;
}

interface PostFormProps {
  boardId: string;
  workspaceSlug: string;
  boardSlug: string;
  post?: Post | null;
  categories?: Category[];
  isReadOnly?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function PostForm({
  boardId,
  workspaceSlug,
  boardSlug,
  post,
  categories = [],
  isReadOnly = false,
}: PostFormProps) {
  const { methods, onSubmit, onDelete, isSubmitting, isDeleting, isEditing } = usePostForm({
    boardId,
    workspaceSlug,
    boardSlug,
    post,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    formState: { isDirty },
  } = methods;

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <FormProvider {...methods}>
      <FormGuard isDirty={isDirty} enabled={!isReadOnly}>
        <form onSubmit={onSubmit}>
          <TwoColumnLayout
            leftContent={
              <LeftComponent
                methods={methods}
                isReadOnly={isReadOnly}
                categoryOptions={categoryOptions}
              />
            }
            rightContent={
              <RightComponent methods={methods} isReadOnly={isReadOnly} isEditing={isEditing} />
            }
          />

          {!isReadOnly && (
            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              cancelHref={`/dashboard/${workspaceSlug}/boards/${boardSlug}`}
              submitLabel={isEditing ? 'Save Post' : 'Create Post'}
              showDelete={isEditing}
              onDelete={() => setShowDeleteConfirm(true)}
              isDeleting={isDeleting}
            />
          )}
        </form>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Post"
          description="Are you sure you want to delete this post? This action cannot be undone."
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

// =============================================================================
// LEFT COMPONENT
// =============================================================================

function LeftComponent({
  methods,
  isReadOnly,
  categoryOptions,
}: {
  methods: any;
  isReadOnly: boolean;
  categoryOptions: { value: string; label: string }[];
}) {
  return (
    <>
      <CustomCard heading="Post Details">
        <div className="space-y-4">
          <FormInput
            name="title"
            label="Title"
            placeholder="Brief, descriptive title for your request"
            isRequired
            disabled={isReadOnly}
            maxLength={200}
          />

          <FormTextarea
            name="content"
            label="Description"
            placeholder="Describe your feature request or bug report in detail. What problem does it solve? How would it work?"
            isRequired
            disabled={isReadOnly}
            rows={8}
          />

          {categoryOptions.length > 0 && (
            <FormSelect
              name="categoryId"
              label="Category"
              options={[{ value: '', label: 'No category' }, ...categoryOptions]}
              disabled={isReadOnly}
            />
          )}
        </div>
      </CustomCard>
    </>
  );
}

// =============================================================================
// RIGHT COMPONENT
// =============================================================================

function RightComponent({
  methods,
  isReadOnly,
  isEditing,
}: {
  methods: any;
  isReadOnly: boolean;
  isEditing: boolean;
}) {
  const status = useWatch({ control: methods.control, name: 'status' });

  if (!isEditing) {
    return (
      <CustomCard heading="Submission Tips">
        <div className="text-sm text-muted-foreground space-y-3">
          <p>Write a clear, descriptive title that summarizes your request.</p>
          <p>In the description, explain:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>What problem you're trying to solve</li>
            <li>How you'd expect the feature to work</li>
            <li>Any workarounds you're currently using</li>
          </ul>
          <p className="text-xs mt-4">
            The more context you provide, the better we can prioritize and implement your request.
          </p>
        </div>
      </CustomCard>
    );
  }

  return (
    <>
      <CustomCard heading="Status & Settings">
        <div className="space-y-4">
          <FormSelect name="status" label="Status" options={STATUS_OPTIONS} disabled={isReadOnly} />

          <ConditionalFieldWrapper show={status === 'PLANNED' || status === 'IN_PROGRESS'}>
            <FormInput
              name="eta"
              label="Estimated Completion"
              type="text"
              placeholder="Q2 2025"
              disabled={isReadOnly}
            />
          </ConditionalFieldWrapper>

          <div className="space-y-3 pt-2">
            <FormSwitch
              name="isPinned"
              label="Pin to top"
              description="Pinned posts appear first in the list"
              disabled={isReadOnly}
            />

            <FormSwitch
              name="isLocked"
              label="Lock post"
              description="Prevent new comments and votes"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </CustomCard>

      <CustomCard heading="Post Info">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Created</span>
            <span>Mar 15, 2025</span>
          </div>
          <div className="flex justify-between">
            <span>Votes</span>
            <span>24</span>
          </div>
          <div className="flex justify-between">
            <span>Comments</span>
            <span>8</span>
          </div>
        </div>
      </CustomCard>
    </>
  );
}
