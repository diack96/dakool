/**
 * Composant Badge moderne et réutilisable
 * Design System - Waraba Academy
 * Respecte la charte graphique définie dans DESIGN_SYSTEM.md
 */


import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { badgeClasses } from '@/lib/design/components';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'level' | 'free' | 'popular' | 'starter';
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'level', children, ...props }, ref) => {
    // Variants selon la charte graphique
    const variants = {
      level: badgeClasses.level,
      free: badgeClasses.free,
      popular: badgeClasses.popular,
      starter: badgeClasses.starter,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center transition-colors',
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
