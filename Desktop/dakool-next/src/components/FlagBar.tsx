/**
 * Filet de fin de section en trois valeurs de gris.
 * Remplace l'ancien liseré aux couleurs du drapeau : même rôle graphique,
 * mais dans la palette monochrome du site.
 */
export default function FlagBar({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-[3px] w-full ${className}`}>
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-white/40" />
      <span className="flex-1 bg-white/15" />
    </div>
  );
}
