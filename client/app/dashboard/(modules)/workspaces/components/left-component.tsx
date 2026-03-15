'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { CustomCard, FormInput, FormTextarea } from '@/components/custom';
import { Sparkles } from 'lucide-react';

interface LeftComponentProps {
  methods: UseFormReturn<any>;
  isReadOnly: boolean;
  generateSlug: () => void;
}

export default function LeftComponent({ methods, isReadOnly, generateSlug }: LeftComponentProps) {
  return (
    <>
      <CustomCard heading="Basic Information">
        <div className="space-y-4">
          <FormInput
            name="name"
            label="Workspace Name"
            placeholder="My Company"
            isRequired
            disabled={isReadOnly}
            helper="The display name for your workspace"
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <FormInput
                name="slug"
                label="Workspace URL"
                placeholder="my-company"
                isRequired
                disabled={isReadOnly}
                prefix={<span className="text-muted-foreground text-sm">resonate.app/</span>}
                helper="Used in URLs. Only lowercase letters, numbers, and hyphens."
              />
            </div>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateSlug}
                className="mb-6"
                title="Generate from name"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>

          <FormTextarea
            name="description"
            label="Description"
            placeholder="A brief description of your workspace..."
            disabled={isReadOnly}
            rows={3}
          />
        </div>
      </CustomCard>
    </>
  );
}
