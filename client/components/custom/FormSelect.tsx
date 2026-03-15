'use client';

import * as React from 'react';
import { Controller, useFormContext, Control, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormLabel from './FormLabel';
import FormError from './FormError';
import FormHelper from './FormHelper';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FormSelectProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  label?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isRequired?: boolean;
  className?: string;
  helper?: string;
  onValueChange?: (value: string) => void;
}

export default function FormSelect<T extends FieldValues = FieldValues>({
  name,
  control: externalControl,
  label,
  options,
  placeholder = 'Select an option',
  disabled = false,
  isRequired = false,
  className,
  helper,
  onValueChange,
}: FormSelectProps<T>) {
  const formContext = useFormContext<T>();
  const control = externalControl || formContext?.control;

  if (!control) {
    console.error(`FormSelect: No control found for field "${name}".`);
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

          return (
            <Select
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(hasError && 'border-destructive focus:ring-destructive')}
                aria-invalid={hasError}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
      <FormError name={name} />
      {helper && <FormHelper>{helper}</FormHelper>}
    </div>
  );
}
