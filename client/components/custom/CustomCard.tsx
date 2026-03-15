'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CustomCardProps {
  heading?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export default function CustomCard({
  heading,
  description,
  children,
  action,
  footer,
  className,
  contentClassName,
  noPadding = false,
}: CustomCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      {(heading || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            {heading && <CardTitle className="text-lg font-semibold">{heading}</CardTitle>}
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!noPadding && 'px-6 pb-6', !heading && 'pt-6', contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className="border-t px-6 py-4">{footer}</CardFooter>}
    </Card>
  );
}
