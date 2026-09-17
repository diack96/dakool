/**
 * Ferme le site derrière une page d'attente.
 *
 * À `true`, chaque adresse affiche « Site indisponible » : ni catalogue, ni
 * menu, ni panier, et les moteurs de recherche sont priés de ne pas indexer.
 * Repasser à `false` rouvre tout — c'est le seul endroit à toucher.
 */
export const SITE_LOCKED = true;

/** Adresse de la page d'attente, exclue de la réécriture. */
export const LOCK_PATH = '/indisponible';
