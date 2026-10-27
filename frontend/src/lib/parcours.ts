import { BookOpen, Compass, GraduationCap, type LucideIcon } from 'lucide-react';

/** Date limite des inscriptions affichée sur l'accueil */
export const INSCRIPTIONS_DATE_LIMITE = '30 novembre 2026';

export interface Parcours {
  slug: string;
  titre: string;
  resume: string;
  icon: LucideIcon;
}

/** Les trois étapes du parcours de formation, dans l'ordre */
export const PARCOURS: Parcours[] = [
  {
    slug: 'ecole-biblique',
    titre: 'École biblique',
    resume: 'Consolider les fondements bibliques et doctrinaux de la foi chrétienne.',
    icon: BookOpen,
  },
  {
    slug: 'parcours-theologique-personnalise',
    titre: 'Parcours théologique personnalisé',
    resume: "Approfondir l'étude des Écritures grâce à un programme structuré et adapté aux objectifs de l'étudiant.",
    icon: GraduationCap,
  },
  {
    slug: 'mentorat-theologique-et-ministeriel',
    titre: 'Mentorat théologique et ministériel',
    resume: "Développer le discernement, le caractère et les compétences nécessaires à l'exercice du ministère.",
    icon: Compass,
  },
];
