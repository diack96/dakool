/**
 * Groupage des milliers.
 *
 * Volontairement manuel plutôt que `toLocaleString` : les données ICU peuvent
 * différer entre le rendu serveur et le navigateur (espace fine insécable vs
 * espace normale), ce qui provoque des erreurs d'hydratation React.
 */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
