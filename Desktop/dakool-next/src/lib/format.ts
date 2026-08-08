/**
 * Formatage des prix en euros.
 *
 * Volontairement manuel plutôt que `toLocaleString` : les données ICU peuvent
 * différer entre le rendu serveur et le navigateur (espace fine insécable vs
 * espace normale), ce qui provoque des erreurs d'hydratation React.
 */
export function formatPrice(value: number): string {
  const grouped = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} €`;
}

/** Variante sans devise, pour les compositions typographiques. */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
