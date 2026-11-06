/**
 * Parcours guidé après l'inscription (page /bienvenue) : choix proposés à l'élève
 * et recommandation des formations qui lui correspondent.
 *
 * Les valeurs doivent rester identiques à celles du backend (App\Learning\LearningPreferences).
 */
import { HelpCircle, type LucideIcon } from 'lucide-react';
import { PARCOURS } from './parcours';
import type { FormationDto } from './catalog';
import { apiFetch } from './api';

export interface LearningPreferences {
  interests: string[];
  level: string | null;
  goal: string | null;
}

export interface InterestGroup {
  institut: string;
  interests: { value: string; description: string }[];
}

/** Domaines, regroupés par institut (sous-catégories des formations) */
export const INTEREST_GROUPS: InterestGroup[] = [
  {
    institut: 'Institut Biblique Théologique',
    interests: [
      { value: 'Formation biblique', description: 'Découvrir et étudier les Écritures' },
      { value: 'Discipulat', description: 'Grandir dans sa marche avec Dieu' },
      { value: 'Développement personnel', description: 'Identité, caractère et équilibre' },
      { value: 'Famille et vie chrétienne', description: 'Couple, éducation, vie de foyer' },
      { value: 'Autres programmes', description: 'Thématiques complémentaires' },
    ],
  },
  {
    institut: 'École du Ministère et du Leadership',
    interests: [
      { value: 'Leadership chrétien', description: 'Conduire et servir une équipe' },
      { value: 'Ministère', description: 'Se préparer à servir dans l’Église' },
      { value: 'Formation poussée', description: 'Approfondir la théologie' },
    ],
  },
];

export const ALL_INTERESTS = INTEREST_GROUPS.flatMap((g) => g.interests.map((i) => i.value));

export const LEVELS: { value: string; title: string; description: string }[] = [
  { value: 'Débutant', title: 'Je découvre', description: 'Je débute ou je reprends les bases.' },
  { value: 'Intermédiaire', title: 'J’ai des bases', description: 'Je connais les fondements et veux aller plus loin.' },
  { value: 'Avancé', title: 'Je veux approfondir', description: 'Je cherche un enseignement exigeant.' },
];

export const GOALS: { value: string; title: string; description: string; icon: LucideIcon }[] = [
  ...PARCOURS.map((p) => ({ value: p.slug, title: p.titre, description: p.resume, icon: p.icon })),
  { value: 'indecis', title: 'Je ne sais pas encore', description: 'Je souhaite d’abord découvrir les formations.', icon: HelpCircle },
];

/**
 * Formations recommandées : celles des domaines choisis, au niveau de l'élève d'abord,
 * hors formations déjà obtenues. Sans domaine choisi, aucune recommandation.
 */
export function recommendFormations(
  formations: FormationDto[],
  prefs: LearningPreferences,
  ownedIds: number[] = [],
  limit = 6,
): FormationDto[] {
  if (prefs.interests.length === 0) return [];

  const levelRank = (level?: string | null) => LEVELS.findIndex((l) => l.value === level);
  const wanted = levelRank(prefs.level);

  const score = (f: FormationDto) => {
    if (wanted < 0 || !f.level) return 1;
    const gap = Math.abs(levelRank(f.level) - wanted);
    return levelRank(f.level) < 0 ? 1 : 2 - Math.min(gap, 2); // même niveau : 2, voisin : 1, éloigné : 0
  };

  return formations
    .filter((f) => f.category && prefs.interests.includes(f.category) && !ownedIds.includes(f.id) && f.published !== false)
    .sort((a, b) => score(b) - score(a) || prefs.interests.indexOf(a.category!) - prefs.interests.indexOf(b.category!))
    .slice(0, limit);
}

export async function savePreferences(prefs: Partial<LearningPreferences>): Promise<boolean> {
  const res = await apiFetch('/api/me/preferences', { method: 'PUT', body: JSON.stringify(prefs) });
  return res.ok;
}
