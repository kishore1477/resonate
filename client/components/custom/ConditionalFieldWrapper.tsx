'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ConditionalFieldWrapperProps {
  show: boolean;
  children: React.ReactNode;
  styled?: boolean;
  className?: string;
}

export default function ConditionalFieldWrapper({
  show,
  children,
  styled = true,
  className,
}: ConditionalFieldWrapperProps) {
  if (!show) return null;

  if (!styled) return <>{children}</>;

  return (
    <div
      className={cn(
        'bg-muted/50 border border-muted-foreground/10 p-4 md:p-5 rounded-lg space-y-4',
        className
      )}
    >
      {children}
    </div>
  );
}
