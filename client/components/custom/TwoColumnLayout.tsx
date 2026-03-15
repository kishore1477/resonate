'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TwoColumnLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  gap?: string;
  className?: string;
  reverseOnMobile?: boolean;
}

export default function TwoColumnLayout({
  leftContent,
  rightContent,
  leftWidth = 'w-full md:w-2/3',
  rightWidth = 'w-full md:w-1/3',
  gap = 'gap-6',
  className,
  reverseOnMobile = false,
}: TwoColumnLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row',
        gap,
        reverseOnMobile && 'flex-col-reverse md:flex-row',
        className
      )}
    >
      <div className={cn(leftWidth, 'flex flex-col gap-4 md:gap-6')}>{leftContent}</div>
      <div className={cn(rightWidth, 'flex flex-col gap-4 md:gap-6')}>{rightContent}</div>
    </div>
  );
}
