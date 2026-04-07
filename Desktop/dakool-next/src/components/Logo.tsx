import Image from 'next/image';

type Props = {
  height?: number;
  className?: string;
};

export default function Logo({ height = 36, className = '' }: Props) {
  const width = Math.round(height * (400 / 191));
  return (
    <Image
      src="/dakool-logo.png"
      alt="Dakool"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
