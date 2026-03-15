'use client';

import { Controller, useFormContext, Control, FieldValues, Path } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormSwitchProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control?: Control<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function FormSwitch<T extends FieldValues = FieldValues>({
  name,
  control: externalControl,
  label,
  description,
  disabled = false,
  className,
}: FormSwitchProps<T>) {
  const formContext = useFormContext<T>();
  const control = externalControl || formContext?.control;

  if (!control) {
    console.error(`FormSwitch: No control found for field "${name}".`);
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('flex items-center justify-between', className)}>
          <div className="space-y-0.5">
            {label && (
              <Label htmlFor={name} className="text-sm font-medium">
                {label}
              </Label>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <Switch
            id={name}
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </div>
      )}
    />
  );
}
