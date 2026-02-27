import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
}

const variantClasses: Record<string, string> = {
  default: 'bg-stone-100 text-stone-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  outline: 'border border-stone-300 text-stone-700 bg-white',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export function statusBadge(status: string): React.ReactElement {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending_review: { label: 'Pending Review', variant: 'warning' },
    interview_scheduled: { label: 'Interview Scheduled', variant: 'info' },
    interview_completed: { label: 'Interview Completed', variant: 'info' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'error' },
    no_show: { label: 'No Show', variant: 'error' },
    open: { label: 'Open', variant: 'success' },
    filled: { label: 'Filled', variant: 'info' },
    completed: { label: 'Completed', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'error' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    held: { label: 'Held (Escrow)', variant: 'warning' },
    released: { label: 'Released', variant: 'success' },
    refunded: { label: 'Refunded', variant: 'error' },
    disputed: { label: 'Disputed', variant: 'error' },
    scheduled: { label: 'Scheduled', variant: 'info' },
    in_progress: { label: 'In Progress', variant: 'warning' },
  }

  const config = map[status] || { label: status, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
