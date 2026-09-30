import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-hover text-text-main border border-border-strong font-bold',
  neutral: 'bg-surface-hover text-text-main font-bold border border-border-strong',
  success: 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border border-emerald-500/50 font-bold',
  warning: 'bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/50 font-bold',
  danger: 'bg-rose-500/20 text-rose-950 dark:text-rose-200 border border-rose-500/50 font-bold',
  info: 'bg-sky-500/20 text-sky-950 dark:text-sky-200 border border-sky-500/50 font-bold',
  outline: 'bg-surface-hover/80 text-text-main font-bold border border-border-strong shadow-2xs',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-mono uppercase font-semibold tracking-wider',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
