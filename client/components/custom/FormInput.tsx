'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  Control,
  FieldValues,
  RegisterOptions,
  Path,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { InputGroup } from '@/components/ui/input-group';
import FormLabel from './FormLabel';
import FormError from './FormError';
import FormHelper from './FormHelper';
import { cn } from '@/lib/utils';

interface FormInputProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  label?: React.ReactNode;
  rules?: RegisterOptions<T>;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  type?: 'text' | 'number' | 'email' | 'tel' | 'url';
  isRequired?: boolean;
  className?: string;
  inputClassName?: string;
  helper?: string;
  maxLength?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  autoComplete?: string;
  formatNumber?: boolean;
}

export default function FormInput<T extends FieldValues = FieldValues>({
  name,
  control: externalControl,
  label,
  rules,
  placeholder,
  disabled = false,
  readOnly = false,
  type = 'text',
  isRequired = false,
  className,
  inputClassName,
  helper,
  maxLength,
  prefix,
  suffix,
  autoComplete,
  formatNumber = false,
}: FormInputProps<T>) {
  const formContext = useFormContext<T>();
  const control = externalControl || formContext?.control;

  if (!control) {
    console.error(
      `FormInput: No control found for field "${name}". Use FormProvider or pass control prop.`
    );
    return null;
  }

  const formatWithCommas = (value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString('en-US');
  };

  const parseNumber = (value: string): string => {
    return value.replace(/,/g, '');
  };

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
        rules={rules}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;

          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;

            if (type === 'number' && formatNumber) {
              value = parseNumber(value);
            }

            field.onChange(type === 'number' ? (value === '' ? '' : Number(value)) : value);
          };

          const displayValue = (() => {
            if (
              type === 'number' &&
              formatNumber &&
              field.value !== '' &&
              field.value !== undefined
            ) {
              return formatWithCommas(field.value);
            }
            return field.value ?? '';
          })();

          const inputElement = (
            <Input
              {...field}
              id={name}
              type={type === 'number' && formatNumber ? 'text' : type}
              value={displayValue}
              onChange={handleChange}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={maxLength}
              autoComplete={autoComplete}
              className={cn(
                hasError && 'border-destructive focus-visible:ring-destructive',
                inputClassName
              )}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : helper ? `${name}-helper` : undefined}
            />
          );

          if (prefix || suffix) {
            return (
              <InputGroup>
                {prefix && <InputGroup.Prefix>{prefix}</InputGroup.Prefix>}
                {inputElement}
                {suffix && <InputGroup.Suffix>{suffix}</InputGroup.Suffix>}
              </InputGroup>
            );
          }

          return inputElement;
        }}
      />
      <FormError name={name} />
      {helper && <FormHelper id={`${name}-helper`}>{helper}</FormHelper>}
    </div>
  );
}
