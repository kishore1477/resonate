'use client';

import * as React from 'react';
import { Controller, useFormContext, Control, FieldValues, Path } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import FormLabel from './FormLabel';
import FormError from './FormError';
import FormHelper from './FormHelper';
import { cn } from '@/lib/utils';

interface FormTextareaProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  isRequired?: boolean;
  className?: string;
  helper?: string;
  rows?: number;
  maxLength?: number;
}

export default function FormTextarea<T extends FieldValues = FieldValues>({
  name,
  control: externalControl,
  label,
  placeholder,
  disabled = false,
  readOnly = false,
  isRequired = false,
  className,
  helper,
  rows = 4,
  maxLength,
}: FormTextareaProps<T>) {
  const formContext = useFormContext<T>();
  const control = externalControl || formContext?.control;

  if (!control) {
    console.error(`FormTextarea: No control found for field "${name}".`);
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <FormLabel htmlFor={name} isRequired={isRequired}>
          {label}
        </FormLabel>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;
          const charCount = field.value?.length || 0;

          return (
            <div className="relative">
              <Textarea
                {...field}
                id={name}
                value={field.value ?? ''}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                rows={rows}
                maxLength={maxLength}
                className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
                aria-invalid={hasError}
              />
              {maxLength && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {charCount}/{maxLength}
                </div>
              )}
            </div>
          );
        }}
      />
      <FormError name={name} />
      {helper && <FormHelper>{helper}</FormHelper>}
    </div>
  );
}
