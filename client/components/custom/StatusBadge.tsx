'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'OPEN' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'SHIPPED' | 'CLOSED';
  className?: string;
}

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  PLANNED: {
    label: 'Planned',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface StatusBadgeCustomProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const VARIANT_CONFIG = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function StatusBadgeCustom({
  label,
  variant = 'default',
  className,
}: StatusBadgeCustomProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CONFIG[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
