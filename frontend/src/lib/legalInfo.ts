/**
 * Informations légales de l'Académie, utilisées par les CGU, les CGV et le formulaire de rétractation.
 *
 * Une valeur `null` n'est pas encore connue : elle s'affiche sur le site comme un repère
 * « À compléter » bien visible (jamais une valeur inventée). À renseigner avant la mise en production.
 */
export const LEGAL_INFO = {
  nom: 'Académie E.S.I.C.',
  /** Structure juridique qui porte l'Académie (registre SIRENE) */
  structure: 'Montagne de la Prière Ministries (MDLP)',
  formeJuridique: 'Association déclarée (loi du 1er juillet 1901)' as string | null,
  rna: 'W911002465',
  /** Uniquement pour une société (laisser null pour une association) */
  capitalSocial: null as string | null,
  siege: '10 rue du 11 Novembre 1918, 91580 Étrechy' as string | null,
  siren: 'SIREN 845 359 298 — SIRET 845 359 298 00013' as string | null,
  /** Numéro de TVA intracommunautaire, ou mention « TVA non applicable, art. 293 B du CGI » */
  tva: null as string | null,
  telephone: '07 66 55 17 82' as string | null,
  directeurPublication: 'Samuel Panzu, président' as string | null,
  /** Médiateur de la consommation effectivement désigné (référencé par la CECMC) */
  mediateur: {
    nom: null as string | null,
    adresse: null as string | null,
    url: null as string | null,
  },
  /** Hébergeurs (mentions légales, art. 6 LCEN) */
  hebergeurs: [
    { role: 'Site (frontend)', nom: 'Vercel Inc.', adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis' as string | null, url: 'https://vercel.com' },
    { role: 'API, back-office et fichiers', nom: 'Cloudways, LLC (groupe DigitalOcean)', adresse: '105 Edgeview Drive, Suite 425, Broomfield, CO 80021, États-Unis' as string | null, url: 'https://www.cloudways.com' },
  ],
  /** Dates de mise à jour / d'entrée en vigueur (ex. « 1er novembre 2026 ») */
  dateCgu: null as string | null,
  dateCgv: null as string | null,
};
