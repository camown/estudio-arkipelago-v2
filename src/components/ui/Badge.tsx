import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
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
  default: 'bg-surface text-foreground border border-border',
  success: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30',
  warning: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30',
  danger: 'bg-accent-red/10 text-accent-red border border-accent-red/30',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  outline: 'bg-transparent text-foreground border border-border',
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
        'inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-mono uppercase font-bold tracking-wider',
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
