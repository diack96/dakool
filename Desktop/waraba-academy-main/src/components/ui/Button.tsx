/**
 * Composant Button moderne et réutilisable
 * Design System - Waraba Academy
 * Respecte la charte graphique définie dans DESIGN_SYSTEM.md
 */


import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { buttonClasses } from '@/lib/design/components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    // Classes de base communes
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variants selon la charte graphique
    const variants = {
      primary: buttonClasses.primary,
      secondary: buttonClasses.secondary,
      success: buttonClasses.success,
      outline: buttonClasses.outline,
      ghost: buttonClasses.ghost,
    };

    // Tailles
    const sizes = {
      default: 'text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4',
      sm: 'text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3',
      lg: 'text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5',
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
