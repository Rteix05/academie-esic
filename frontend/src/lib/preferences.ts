/**
 * Parcours guidé après l'inscription (page /bienvenue) : choix proposés à l'élève
 * et recommandation des formations qui lui correspondent.
 *
 * Les valeurs doivent rester identiques à celles du backend (App\Learning\LearningPreferences).
 */
import { BookOpen, Church, Crown, Footprints, GraduationCap, HeartHandshake, HelpCircle, LayoutGrid, Sprout, type LucideIcon } from 'lucide-react';
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
  /** Nom court affiché au-dessus du groupe */
  label: string;
  interests: { value: string; description: string; icon: LucideIcon }[];
}

/** Domaines, regroupés par institut (sous-catégories des formations) */
export const INTEREST_GROUPS: InterestGroup[] = [
  {
    institut: 'Institut Biblique Théologique',
    label: 'Institut 1',
    interests: [
      { value: 'Formation biblique', description: 'Découvrir et étudier les Écritures', icon: BookOpen },
      { value: 'Discipulat', description: 'Grandir dans sa marche avec Dieu', icon: Footprints },
      { value: 'Développement personnel', description: 'Identité, caractère et équilibre', icon: Sprout },
      { value: 'Famille et vie chrétienne', description: 'Couple, éducation, vie de foyer', icon: HeartHandshake },
      { value: 'Autres programmes', description: 'Thématiques complémentaires', icon: LayoutGrid },
    ],
  },
  {
    institut: 'École du Ministère et du Leadership',
    label: 'Institut 2',
    interests: [
      { value: 'Leadership chrétien', description: 'Conduire et servir une équipe', icon: Crown },
      { value: 'Ministère', description: 'Se préparer à servir dans l’Église', icon: Church },
      { value: 'Formation poussée', description: 'Approfondir la théologie', icon: GraduationCap },
    ],
  },
];

export const ALL_INTERESTS = INTEREST_GROUPS.flatMap((g) => g.interests.map((i) => i.value));

/** Niveaux, du plus simple au plus exigeant (l'ordre sert au classement des recommandations) */
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
