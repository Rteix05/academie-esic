/**
 * Informations légales de l'Académie, utilisées par les CGU, les CGV et le formulaire de rétractation.
 *
 * Une valeur `null` n'est pas encore connue : elle s'affiche sur le site comme un repère
 * « À compléter » bien visible (jamais une valeur inventée). À renseigner avant la mise en production.
 */
export const LEGAL_INFO = {
  nom: 'Académie E.S.I.C.',
  formeJuridique: null as string | null,
  /** Uniquement pour une société (laisser null pour une association) */
  capitalSocial: null as string | null,
  siege: null as string | null,
  siren: null as string | null,
  /** Numéro de TVA intracommunautaire, ou mention « TVA non applicable, art. 293 B du CGI » */
  tva: null as string | null,
  telephone: null as string | null,
  directeurPublication: null as string | null,
  /** Médiateur de la consommation effectivement désigné (référencé par la CECMC) */
  mediateur: {
    nom: null as string | null,
    adresse: null as string | null,
    url: null as string | null,
  },
  /** Dates de mise à jour / d'entrée en vigueur (ex. « 1er novembre 2026 ») */
  dateCgu: null as string | null,
  dateCgv: null as string | null,
};
