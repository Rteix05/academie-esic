<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Formation;
use App\Entity\Masterclass;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // 1. Création des Formations
        $formations = [];
        $categories = ['Développement Web', 'Design', 'Marketing', 'Bureautique', 'Management'];
        $niveaux = ['Débutant', 'Intermédiaire', 'Expert'];

        for ($i = 0; $i < 10; $i++) {
            $formation = new Formation();
            $formation->setTitle('Formation ' . $faker->sentence(3));
            $formation->setDescription($faker->paragraph(3));
            $formation->setPrice($faker->randomFloat(2, 49, 499)); // Prix entre 49€ et 499€
            $formation->setDuration($faker->numberBetween(10, 60) . 'h');
            $formation->setLevel($faker->randomElement($niveaux));
            $formation->setCategory($faker->randomElement($categories));
            $formation->setIsPublished($faker->boolean(80)); // 80% de chances d'être publié

            $manager->persist($formation);
            $formations[] = $formation;
        }

        // 2. Création des Masterclass
        $masterclasses = [];
        for ($i = 0; $i < 5; $i++) {
            $masterclass = new Masterclass();
            $masterclass->setTitle('Masterclass ' . $faker->sentence(4));
            $masterclass->setDescription($faker->paragraph(2));
            $masterclass->setSpeakerName($faker->name);
            $masterclass->setScheduledAt(\DateTimeImmutable::createFromMutable($faker->dateTimeBetween('now', '+2 months')));
            $masterclass->setPrice($faker->randomFloat(2, 19, 99));
            $masterclass->setIsLive($faker->boolean(20)); // 20% de chances d'être en live actuellement
            $masterclass->setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

            $manager->persist($masterclass);
            $masterclasses[] = $masterclass;
        }

        // 3. Création d'un compte Administrateur
        $admin = new User();
        $admin->setEmail('admin@esic.fr');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->hasher->hashPassword($admin, 'password123'));
        $manager->persist($admin);

        // 4. Création de quelques comptes Élèves avec des achats aléatoires
        for ($i = 0; $i < 5; $i++) {
            $user = new User();
            $user->setEmail('eleve' . $i . '@esic.fr');
            $user->setRoles(['ROLE_USER']);
            $user->setPassword($this->hasher->hashPassword($user, 'password123'));

            // 🟢 On commente temporairement l'attribution des formations pour éviter le crash
            // $user->addFormation($faker->randomElement($formations));
            // if ($faker->boolean()) {
            //     $user->addFormation($faker->randomElement($formations));
            // }

            // 🟢 L'attribution des masterclasses reste active car elle fonctionne parfaitement !
            $user->addMasterclass($faker->randomElement($masterclasses));

            $manager->persist($user);
        }

        $manager->flush();
    }
}