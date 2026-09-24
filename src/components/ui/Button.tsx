'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'default'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'muted';

export type ButtonSize = 'sm' | 'default' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Strict Button Hierarchy
  primary: 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs',
  secondary: 'border border-border-strong hover:border-text-main bg-surface-main hover:bg-surface-hover text-text-main shadow-2xs',
  tertiary: 'bg-transparent text-text-main hover:bg-surface-hover',
  // Backward-compatible & semantic aliases
  default: 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs',
  outline: 'border border-border-strong hover:border-text-main bg-surface-main hover:bg-surface-hover text-text-main shadow-2xs',
  ghost: 'bg-transparent text-text-main hover:bg-surface-hover',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
  muted: 'bg-surface-hover text-muted-main hover:text-text-main',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  default: 'px-4 py-2 text-xs sm:text-sm',
  lg: 'px-5 py-2.5 text-sm sm:text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans font-semibold tracking-wide rounded-lg transition-all duration-150 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
