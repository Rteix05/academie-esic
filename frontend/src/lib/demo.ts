/**
 * Mode démo (NEXT_PUBLIC_DEMO_MODE=1) : l'API Symfony est remplacée par des données fictives,
 * pour présenter le site avant la mise en ligne du backend.
 * Lecture du catalogue uniquement : connexion, inscription, contact et paiement sont désactivés.
 */
import type { FormationDto, MasterclassDto } from './catalog';
import type { NewsItem } from './news';
import type { InstitutPackOffer } from './institutPacks';

const IBT = 'Institut Biblique Théologique';
const EML = 'École du Ministère et du Leadership';

const formations: FormationDto[] = [
  {
    id: 1, title: 'Introduction à la Bible', category: 'Formation biblique', institut: IBT,
    trainer: 'Samuel Panzu', duration: '8 semaines', level: 'Débutant', price: 0,
    description: "<p>Un premier parcours pour découvrir l'organisation de la Bible, ses grands genres littéraires et le fil rouge de l'histoire du salut, de la Genèse à l'Apocalypse.</p>",
    objectives: '<ul><li>Se repérer dans les 66 livres de la Bible</li><li>Comprendre le contexte historique des Écritures</li><li>Mettre en place une lecture quotidienne</li></ul>',
    modalities: '<p>Cours en ligne à votre rythme, livret PDF et quiz de fin de module.</p>',
    pdfAvailable: true,
  },
  {
    id: 2, title: "Les fondements de la foi chrétienne", category: 'Formation biblique', institut: IBT,
    trainer: 'Filomena Panzu', duration: '10 semaines', level: 'Débutant', price: 49,
    description: '<p>Salut, grâce, foi, Saint-Esprit, Église : les doctrines essentielles présentées simplement, appuyées sur les textes bibliques.</p>',
    objectives: '<ul><li>Expliquer les bases de la foi avec ses propres mots</li><li>Relier chaque doctrine aux Écritures</li></ul>',
    modalities: '<p>Cours en ligne, livret PDF et accompagnement par un enseignant.</p>',
    pdfAvailable: true,
  },
  {
    id: 3, title: "Herméneutique : bien interpréter les Écritures", category: 'Formation poussée', institut: IBT,
    trainer: 'Filomena Panzu', duration: '12 semaines', level: 'Avancé', price: 129,
    description: "<p>Méthodes d'interprétation, contexte historique et culturel, genres littéraires : les outils pour étudier la Bible avec rigueur.</p>",
    objectives: '<ul><li>Appliquer une méthode d’étude inductive</li><li>Éviter les erreurs d’interprétation courantes</li></ul>',
    modalities: '<p>Cours en ligne, exercices pratiques et livret PDF.</p>',
    pdfAvailable: true,
  },
  {
    id: 4, title: 'Les Évangiles et la vie de Jésus', category: 'Formation biblique', institut: IBT,
    trainer: 'Samuel Panzu', duration: '6 semaines', level: 'Intermédiaire', price: 59,
    description: '<p>Une lecture suivie des quatre Évangiles pour comprendre le ministère, les enseignements et l’œuvre de Jésus-Christ.</p>',
    modalities: '<p>Cours en ligne et livret PDF.</p>',
    pdfAvailable: true,
  },
  {
    id: 5, title: 'Marcher en disciple', category: 'Discipulat', institut: IBT,
    trainer: 'Filomena Panzu', duration: '6 semaines', level: 'Débutant', price: 39,
    description: '<p>Prière, lecture de la Parole, communion fraternelle : bâtir une vie de disciple solide et durable.</p>',
    modalities: '<p>Cours en ligne et livret PDF.</p>',
    pdfAvailable: true,
  },
  {
    id: 6, title: 'Couple et famille selon le cœur de Dieu', category: 'Famille et vie chrétienne', institut: EML,
    trainer: 'Filomena Panzu', duration: '8 semaines', level: 'Tous niveaux', price: 69,
    description: '<p>Communication, pardon, éducation des enfants, gestion du foyer : des principes bibliques appliqués à la vie de famille.</p>',
    modalities: '<p>Cours en ligne, livret PDF et exercices à faire en couple.</p>',
    pdfAvailable: true,
  },
  {
    id: 7, title: 'Leadership serviteur', category: 'Leadership chrétien', institut: EML,
    trainer: 'Samuel Panzu', duration: '10 semaines', level: 'Intermédiaire', price: 99,
    description: "<p>Diriger à la manière de Christ : vision, intégrité, gestion d'équipe et accompagnement des personnes.</p>",
    objectives: '<ul><li>Définir et partager une vision</li><li>Former et responsabiliser une équipe</li></ul>',
    modalities: '<p>Cours en ligne, études de cas et livret PDF.</p>',
    pdfAvailable: true,
  },
  {
    id: 8, title: 'Les fondements du ministère', category: 'Ministère', institut: EML,
    trainer: 'Samuel Panzu', duration: '12 semaines', level: 'Avancé', price: 119,
    description: '<p>Appel, dons spirituels, prédication et accompagnement pastoral : se préparer à servir dans l’Église locale.</p>',
    modalities: '<p>Cours en ligne et livret PDF.</p>',
    pdfAvailable: true,
  },
  {
    id: 9, title: 'Développer son potentiel en Christ', category: 'Développement personnel', institut: EML,
    trainer: 'Filomena Panzu', duration: '5 semaines', level: 'Tous niveaux', price: 0,
    description: '<p>Identité, gestion du temps, discipline personnelle : grandir dans toutes les dimensions de sa vie.</p>',
    modalities: '<p>Cours en ligne.</p>',
    pdfAvailable: false,
  },
];

const masterclasses: MasterclassDto[] = [
  {
    id: 1, title: "Prier avec puissance", category: 'Vie spirituelle', expert: 'Samuel Panzu',
    description: '<p>Une masterclass pour renouveler sa vie de prière : intercession, adoration et persévérance.</p>',
    scheduledAt: '2026-11-14T15:00:00+01:00', pricePdf: 9, priceVideo: 19, pricePack: 24,
    videoAvailable: true, pdfAvailable: true,
  },
  {
    id: 2, title: 'Gérer ses finances selon la Bible', category: 'Famille et vie chrétienne', expert: 'Samuel & Filomena Panzu',
    description: '<p>Budget, dette, générosité et épargne : les principes bibliques pour une gestion sage de l’argent.</p>',
    scheduledAt: '2026-11-28T15:00:00+01:00', pricePdf: 9, priceVideo: 19, pricePack: 24,
    videoAvailable: true, pdfAvailable: true,
  },
  {
    id: 3, title: 'Prêcher avec clarté', category: 'Leadership chrétien', expert: 'Samuel Panzu',
    description: '<p>Structurer un message, captiver son auditoire et rester fidèle au texte biblique.</p>',
    scheduledAt: '2026-12-12T15:00:00+01:00', pricePdf: 12, priceVideo: 24, pricePack: 29,
    videoAvailable: true, pdfAvailable: true,
  },
];

const news: NewsItem[] = [
  { id: 3, title: 'Ouverture des inscriptions', summary: 'Les inscriptions à la nouvelle session de formations sont ouvertes. Rejoignez-nous dès maintenant !', publishedAt: '2026-10-10T09:00:00+02:00' },
  { id: 2, title: 'Nouvelle masterclass : Prier avec puissance', summary: 'Le Samuel Panzu animera une masterclass consacrée à la prière le 14 novembre.', publishedAt: '2026-10-03T09:00:00+02:00' },
  { id: 1, title: "L'Académie E.S.I.C. arrive en ligne", summary: 'Nos formations sont désormais accessibles partout, à votre rythme.', publishedAt: '2026-09-20T09:00:00+02:00' },
];

const offers: InstitutPackOffer[] = [
  { pack: 'ibt', institut: IBT, label: 'Accès complet à l’Institut Biblique Théologique', amount: 199, currency: 'EUR' },
  { pack: 'eml', institut: EML, label: 'Accès complet à l’École du Ministère et du Leadership', amount: 199, currency: 'EUR' },
];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

/** Réponse fictive à un appel de l'API (mêmes formats que le backend) */
export function demoResponse(path: string, init: RequestInit = {}): Response {
  const url = new URL(path, 'http://demo');
  const method = (init.method ?? 'GET').toUpperCase();

  if (method !== 'GET') {
    return json({ message: 'Démonstration : cette fonctionnalité sera disponible à la mise en ligne du site.' }, 503);
  }

  const p = url.pathname;
  let m: RegExpMatchArray | null;
  if (p === '/api/formations') return json({ member: formations });
  if ((m = p.match(/^\/api\/formations\/(\d+)$/))) {
    const f = formations.find((x) => x.id === Number(m![1]));
    return f ? json(f) : json({ message: 'Introuvable' }, 404);
  }
  if (p === '/api/masterclasses') return json({ member: masterclasses });
  if ((m = p.match(/^\/api\/masterclasses\/(\d+)$/))) {
    const mc = masterclasses.find((x) => x.id === Number(m![1]));
    return mc ? json(mc) : json({ message: 'Introuvable' }, 404);
  }
  if (p === '/api/actualites') {
    const limit = Number(url.searchParams.get('limit')) || news.length;
    return json(news.slice(0, limit));
  }
  if (p === '/api/institut-packs') return json(offers);

  // Espace élève (/api/me, /api/mes-*…) : personne n'est connecté en démo
  return json({ message: 'Non connecté' }, 401);
}
