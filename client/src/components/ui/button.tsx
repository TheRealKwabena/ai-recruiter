import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-primary-600 text-white shadow-soft-card hover:bg-primary-700 focus-visible:ring-primary-300',
  secondary:
    'bg-white/80 text-primary-700 border border-primary-100 shadow hover:bg-white focus-visible:ring-primary-200',
  outline:
    'border border-white/50 text-white bg-transparent hover:bg-white/10 focus-visible:ring-white/40',
  ghost: 'text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-12 px-6',
  sm: 'h-9 px-4 text-sm',
  lg: 'h-14 px-8 text-lg',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

