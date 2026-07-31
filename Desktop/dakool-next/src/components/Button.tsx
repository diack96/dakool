import Link from 'next/link';

type Variant = 'solid' | 'outline' | 'dark' | 'darkOutline';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
};

const variants: Record<Variant, string> = {
  /* ---- Sur fond noir ---- */
  solid: 'bg-white text-black hover:bg-accent',
  outline: 'border border-line-strong text-white hover:border-white hover:bg-white hover:text-black',

  /* ---- Sur fond blanc (bandeaux CTA inversés) ---- */
  dark: 'bg-ink text-white hover:bg-raised',
  darkOutline: 'border border-black/25 text-black hover:bg-ink hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[11px]',
  md: 'px-7 py-3.5 text-xs sm:px-8 sm:py-4 sm:text-sm',
  lg: 'px-8 py-4 text-sm sm:px-10 sm:py-5',
};

export default function Button({
  children,
  href,
  variant = 'solid',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  onClick,
}: Props) {
  const classes = [
    'inline-flex items-center justify-center gap-2.5 text-center font-black uppercase tracking-cta',
    'transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40',
    variants[variant],
    sizes[size],
    className,
  ].join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
