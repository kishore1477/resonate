'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFooterProps {
  isSubmitting?: boolean;
  isDirty?: boolean;
  cancelHref?: string;
  onCancel?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  showDelete?: boolean;
  showSaveAndClose?: boolean;
  submitLabel?: string;
  className?: string;
  sticky?: boolean;
}

export default function FormFooter({
  isSubmitting = false,
  isDirty = true,
  cancelHref,
  onCancel,
  onDelete,
  isDeleting = false,
  showDelete = false,
  showSaveAndClose = true,
  submitLabel = 'Save',
  className,
  sticky = true,
}: FormFooterProps) {
  const router = useRouter();
  const [isSaveAndClose, setIsSaveAndClose] = React.useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (cancelHref) {
      router.push(cancelHref);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t bg-background py-4',
        sticky && 'sticky bottom-0 left-0 right-0 z-10 px-6 -mx-6 mt-6',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting || isDeleting}
        >
          Cancel
        </Button>
        {showDelete && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showSaveAndClose && (
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting || !isDirty}
            onClick={() => setIsSaveAndClose(true)}
          >
            {isSubmitting && isSaveAndClose ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Close'
            )}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          onClick={() => setIsSaveAndClose(false)}
        >
          {isSubmitting && !isSaveAndClose ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>

        {/* Hidden field to track which button was clicked */}
        <input type="hidden" name="isSaveAndClose" value={isSaveAndClose ? 'true' : 'false'} />
      </div>
    </div>
  );
}
