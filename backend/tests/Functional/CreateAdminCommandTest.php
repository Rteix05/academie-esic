<?php

namespace App\Tests\Functional;

use App\Entity\User;
use App\Tests\ApiTestCase;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

class CreateAdminCommandTest extends ApiTestCase
{
    private function runCommand(string $email, array $answers): CommandTester
    {
        $tester = new CommandTester((new Application(self::$kernel))->find('app:create-admin'));
        $tester->setInputs($answers);
        $tester->execute(['email' => $email]);

        return $tester;
    }

    private function findUser(string $email): ?User
    {
        $this->em()->clear();

        return $this->em()->getRepository(User::class)->findOneBy(['email' => $email]);
    }

    public function testCreatesAnAdministratorWithAHashedPassword(): void
    {
        $password = self::validPassword();
        $tester = $this->runCommand(' Admin@Esich.fr ', [$password, $password]);

        self::assertSame(Command::SUCCESS, $tester->getStatusCode());
        $admin = $this->findUser('admin@esich.fr');
        self::assertNotNull($admin);
        self::assertContains('ROLE_ADMIN', $admin->getRoles());
        self::assertNotSame($password, $admin->getPassword());
        self::assertTrue(password_verify($password, $admin->getPassword()));
        self::assertStringNotContainsString($password, $tester->getDisplay());
    }

    public function testPromotesAnExistingAccount(): void
    {
        $this->createUser('eleve@test.fr');
        $password = self::otherValidPassword();

        $tester = $this->runCommand('eleve@test.fr', [$password, $password]);

        self::assertSame(Command::SUCCESS, $tester->getStatusCode());
        $user = $this->findUser('eleve@test.fr');
        self::assertContains('ROLE_ADMIN', $user->getRoles());
        self::assertTrue(password_verify($password, $user->getPassword()));
        self::assertCount(1, $this->em()->getRepository(User::class)->findBy(['email' => 'eleve@test.fr']));
    }

    public function testRejectsAWeakPassword(): void
    {
        $tester = $this->runCommand('admin@esich.fr', ['court1', 'court1']);

        self::assertSame(Command::FAILURE, $tester->getStatusCode());
        self::assertNull($this->findUser('admin@esich.fr'));
    }

    public function testRejectsAMismatchedConfirmation(): void
    {
        $tester = $this->runCommand('admin@esich.fr', [self::validPassword(), self::otherValidPassword()]);

        self::assertSame(Command::FAILURE, $tester->getStatusCode());
        self::assertNull($this->findUser('admin@esich.fr'));
    }

    public function testRejectsAnInvalidEmail(): void
    {
        self::assertSame(Command::FAILURE, $this->runCommand('pas-un-email', [])->getStatusCode());
    }
}
