<?php

namespace App\Learning;

/**
 * Choix proposés à l'élève juste après son inscription (parcours guidé « Bienvenue »),
 * pour lui recommander les formations qui lui correspondent.
 *
 * Les domaines reprennent les sous-catégories des formations (FormationCrudController),
 * les objectifs reprennent les trois étapes du parcours de formation (frontend/src/lib/parcours.ts).
 */
final class LearningPreferences
{
    public const INTERESTS = [
        'Formation biblique',
        'Discipulat',
        'Développement personnel',
        'Famille et vie chrétienne',
        'Leadership chrétien',
        'Formation poussée',
        'Ministère',
        'Autres programmes',
    ];

    public const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];

    public const GOALS = [
        'ecole-biblique'                      => 'École biblique',
        'parcours-theologique-personnalise'   => 'Parcours théologique personnalisé',
        'mentorat-theologique-et-ministeriel' => 'Mentorat théologique et ministériel',
        'indecis'                             => 'Je ne sais pas encore',
    ];
}
