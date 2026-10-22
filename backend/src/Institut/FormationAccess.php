<?php

namespace App\Institut;

use App\Entity\Formation;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\InstitutAccessRepository;

/**
 * Droit d'accès au contenu d'une formation : formation acquise (achat ou inscription gratuite)
 * ou accès complet à son institut.
 */
class FormationAccess
{
    public function __construct(
        private readonly InstitutAccessRepository $institutAccesses,
        private readonly FormationRepository $formations,
    ) {}

    public function canAccess(User $user, Formation $formation): bool
    {
        return $user->getFormations()->contains($formation) || $this->coveredByInstitutAccess($user, $formation);
    }

    /** Formation publiée incluse dans un accès complet à un institut acheté par l'élève */
    public function coveredByInstitutAccess(User $user, Formation $formation): bool
    {
        $pack = InstitutPack::forInstitut($formation->getInstitut());

        return $pack !== null
            && $formation->isPublished()
            && in_array($pack, $this->institutAccesses->packsOwnedBy($user), true);
    }

    /**
     * Formations accessibles, avec leur origine : 'achat' (acquise) ou 'institut'.
     *
     * @return list<array{formation: Formation, access: string}>
     */
    public function accessibleFormations(User $user): array
    {
        $result = [];
        foreach ($user->getFormations() as $formation) {
            $result[$formation->getId()] = ['formation' => $formation, 'access' => 'achat'];
        }

        $packs = $this->institutAccesses->packsOwnedBy($user);
        if ($packs) {
            foreach ($this->formations->findBy(['isPublished' => true], ['id' => 'ASC']) as $formation) {
                if (!isset($result[$formation->getId()]) && in_array(InstitutPack::forInstitut($formation->getInstitut()), $packs, true)) {
                    $result[$formation->getId()] = ['formation' => $formation, 'access' => 'institut'];
                }
            }
        }

        return array_values($result);
    }
}
