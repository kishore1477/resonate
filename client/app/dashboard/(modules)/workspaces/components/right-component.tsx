'use client';

import { UseFormReturn } from 'react-hook-form';
import { CustomCard, FormInput } from '@/components/custom';

interface RightComponentProps {
  methods: UseFormReturn<any>;
  isReadOnly: boolean;
  isEditing: boolean;
}

export default function RightComponent({ methods, isReadOnly, isEditing }: RightComponentProps) {
  if (!isEditing) {
    return (
      <CustomCard heading="Getting Started">
        <div className="text-sm text-muted-foreground space-y-3">
          <p>After creating your workspace, you can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create feedback boards for different products</li>
            <li>Invite team members to collaborate</li>
            <li>Share your public roadmap with customers</li>
            <li>Publish changelogs to keep users updated</li>
          </ul>
        </div>
      </CustomCard>
    );
  }

  return (
    <>
      <CustomCard heading="Branding">
        <div className="space-y-4">
          <FormInput
            name="logo"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            disabled={isReadOnly}
            helper="URL to your workspace logo (square recommended)"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="primaryColor"
              label="Primary Color"
              type="text"
              placeholder="#6366f1"
              disabled={isReadOnly}
            />
            <FormInput
              name="accentColor"
              label="Accent Color"
              type="text"
              placeholder="#8b5cf6"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </CustomCard>

      <CustomCard heading="Workspace Info">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Created</span>
            <span>Mar 15, 2025</span>
          </div>
          <div className="flex justify-between">
            <span>Plan</span>
            <span className="font-medium text-foreground">Free</span>
          </div>
          <div className="flex justify-between">
            <span>Members</span>
            <span>3</span>
          </div>
          <div className="flex justify-between">
            <span>Boards</span>
            <span>2</span>
          </div>
        </div>
      </CustomCard>
    </>
  );
}
