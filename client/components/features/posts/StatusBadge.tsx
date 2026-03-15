'use client';

import { Badge } from '@/components/ui/badge';

type PostStatus = 'OPEN' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'SHIPPED' | 'CLOSED';

const statusConfig: Record<
  PostStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'outline' }
> = {
  OPEN: { label: 'Open', variant: 'secondary' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
  PLANNED: { label: 'Planned', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  SHIPPED: { label: 'Shipped', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'outline' },
};

interface StatusBadgeProps {
  status: PostStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OPEN;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
