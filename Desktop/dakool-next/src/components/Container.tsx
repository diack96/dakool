type Props = {
  children: React.ReactNode;
  /** `wide` pour les grilles pleine largeur, `narrow` pour la lecture longue. */
  size?: 'wide' | 'default' | 'narrow';
  className?: string;
};

const sizes = {
  wide: 'max-w-[100rem]',
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
};

export default function Container({ children, size = 'default', className = '' }: Props) {
  return (
    <div className={`${sizes[size]} mx-auto w-full px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
