'use client';

import { FormProvider } from 'react-hook-form';
import { FormGuard } from '@/components/form-guard';
import { TwoColumnLayout, FormFooter } from '@/components/custom';
import { useWorkspaceForm } from '../hooks/useWorkspaceForm';
import LeftComponent from './left-component';
import RightComponent from './right-component';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  accentColor?: string;
}

interface WorkspaceFormProps {
  workspace?: Workspace | null;
  isReadOnly?: boolean;
}

export default function WorkspaceForm({ workspace, isReadOnly = false }: WorkspaceFormProps) {
  const { methods, onSubmit, isSubmitting, isEditing, generateSlug } = useWorkspaceForm({
    workspace,
  });

  const {
    formState: { isDirty },
  } = methods;

  return (
    <FormProvider {...methods}>
      <FormGuard isDirty={isDirty} enabled={!isReadOnly}>
        <form onSubmit={onSubmit}>
          <TwoColumnLayout
            leftContent={
              <LeftComponent
                methods={methods}
                isReadOnly={isReadOnly}
                generateSlug={generateSlug}
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
              cancelHref="/dashboard"
              submitLabel={isEditing ? 'Save Changes' : 'Create Workspace'}
              showSaveAndClose={isEditing}
            />
          )}
        </form>
      </FormGuard>
    </FormProvider>
  );
}
