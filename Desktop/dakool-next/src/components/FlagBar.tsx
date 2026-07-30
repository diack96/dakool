/** Le liseré vert-jaune-rouge du drapeau sénégalais. Signature de la marque. */
export default function FlagBar({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-[3px] w-full ${className}`}>
      <span className="flex-1 bg-teranga" />
      <span className="flex-1 bg-or" />
      <span className="flex-1 bg-lion" />
    </div>
  );
}
