# Académie E.S.I.C.

Plateforme web de l'**Académie E.S.I.C.** (École du Savoir et de l'Intelligence Chrétienne) : un centre de formation chrétienne qui présente sa vision, propose des **formations** en ligne, vend des **masterclass** premium (vidéo, PDF ou pack) et offre à chaque élève un **espace personnel** pour retrouver ses contenus.

| | |
|---|---|
| Site public | Next.js — `academie-esic.fr` (Vercel) |
| API et back-office | Symfony — `api.academie-esic.fr` (Cloudways) |
| Workflow Git | gitflow — voir [CONTRIBUTING.md](CONTRIBUTING.md) |
| Mise en production | voir [DEPLOIEMENT.md](DEPLOIEMENT.md) |

---

## Sommaire

1. [Objectif du site](#objectif-du-site)
2. [Fonctionnalités](#fonctionnalités)
3. [Stack technique](#stack-technique)
4. [Architecture et organisation du dépôt](#architecture-et-organisation-du-dépôt)
5. [Installation sur sa machine](#installation-sur-sa-machine) — [Windows](#windows) · [macOS](#macos) · [Linux](#linux)
6. [Au quotidien](#au-quotidien)
7. [Tests et qualité](#tests-et-qualité)
8. [Dépannage](#dépannage)

---

## Objectif du site

- **Présenter** l'Académie, son histoire, sa vision et sa mission.
- **Former** : un catalogue de formations (gratuites ou payantes) et de masterclass, présenté comme une plateforme de contenu (carrousels par catégorie, fiches détaillées).
- **Monétiser** les contenus premium avec un paiement en ligne sécurisé et un déblocage automatique après achat.
- **Accompagner** chaque élève : espace personnel, historique des paiements, emails de suivi.
- **Rester accessible et conforme** : accessibilité RGAA, RGPD, CGU / CGV, consentement aux cookies des lecteurs vidéo tiers.

## Fonctionnalités

### Visiteurs
- Accueil, À propos, Comment ça marche, Actualités, Contact, Plan du site.
- Catalogues **Formations** et **Masterclass** : mise en avant, carrousels par catégorie, fiches détaillées (description, durée, niveau, prix, intervenant).
- **Formulaire de contact** : message transmis à l'Académie, accusé de réception au visiteur, protection anti-spam (champ piège, limitation d'envoi).
- **Mode sombre** et **réglages d'affichage** : taille du texte de 90 % à 200 %, liens en gras, texte en gras.
- Pages légales : mentions légales, politique de confidentialité, **CGU**, **CGV**, déclaration d'accessibilité.

### Élèves (compte)
- Inscription (acceptation des CGU), connexion, mot de passe oublié.
- Inscription directe aux formations gratuites.
- **Achat** de formations et de masterclass (PDF, vidéo ou pack) via **Stripe**, avec acceptation des CGV et consentement à l'accès immédiat (renonciation au droit de rétractation) — preuves enregistrées avec chaque paiement.
- **Espace personnel** : formations suivies, masterclass débloquées, historique des paiements, profil.
- **Lecteur vidéo protégé** : filigrane nominatif, vidéos YouTube / Vimeo / Google Drive / Dropbox / pCloud / fichiers ; les lecteurs tiers ne sont chargés qu'après consentement (cookies).
- **Emails** : bienvenue, confirmation de commande (récapitulatif, CGV acceptées), inscription à une formation, réinitialisation du mot de passe, contact.

### Administration
- **Back-office EasyAdmin** (`/admin`) : formations, masterclass (upload vidéo et PDF privés), événements, inscriptions, utilisateurs.

### Sécurité
- Authentification par **JWT en cookie httpOnly**, contrôle d'origine (anti-CSRF), limitation des tentatives (connexion, inscription, contact…).
- Contenus payants servis par des routes protégées et des liens signés ; webhooks Stripe signés et idempotents.

> Les **événements** et la page **Témoignages** existent mais sont masqués en attendant le lancement officiel.

## Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 3, lucide-react, polices Poppins et DM Sans |
| **Backend** | PHP 8.2+, [Symfony 7.4 LTS](https://symfony.com), API Platform 4, Doctrine ORM 3, LexikJWT, EasyAdmin 5, Symfony Mailer / Twig |
| **Paiement** | Stripe Checkout + webhooks |
| **Base de données** | MySQL 8 (MariaDB 10.6+ compatible) |
| **Développement local** | Docker Compose : MySQL, PHP, Node, [MailHog](https://github.com/mailhog/MailHog) (capture des emails) |
| **Qualité** | PHPUnit 11, ESLint, TypeScript, GitHub Actions (CI), GitGuardian |
| **Production** | Vercel (frontend) · Cloudways (API, base, fichiers) |

## Architecture et organisation du dépôt

```
Navigateur ──► Next.js (academie-esic.fr) ──► API Symfony (api.academie-esic.fr) ──► MySQL
                                                    │                 │
                                                    ├─► Stripe        └─► SMTP (emails)
                                                    └─► /admin (EasyAdmin)
```

```
academie-esic/
├── backend/                 API Symfony + back-office
│   ├── config/              configuration (sécurité, JWT, CORS, limitations…)
│   ├── migrations/          migrations Doctrine
│   ├── src/                 contrôleurs, entités, paiement, emails, commandes
│   ├── templates/emails/    emails transactionnels (Twig) et leurs icônes
│   ├── tests/               tests fonctionnels PHPUnit
│   └── .env.example         modèle de configuration
├── frontend/                site Next.js
│   ├── src/app/             pages (App Router)
│   ├── src/components/      composants (catalogue, lecteur vidéo, accessibilité…)
│   ├── src/lib/             client API, infos légales, contact, catalogue
│   └── scripts/             génération des icônes des emails
├── docker/                  images Docker de développement (php, node)
├── deploy/cloudways/        script et modèle de configuration de production
├── docker-compose.yml       environnement de développement
├── CONTRIBUTING.md          workflow gitflow et versionnage
└── DEPLOIEMENT.md           mise en production (Cloudways + Vercel)
```

---

## Installation sur sa machine

L'environnement de développement tourne entièrement dans **Docker** : pas besoin d'installer PHP, MySQL ou Node sur la machine.

| Service | Adresse |
|---|---|
| Site (Next.js) | http://localhost:3000 |
| API (Symfony) | http://localhost:8000/api |
| Back-office | http://localhost:8000/admin |
| Emails capturés (MailHog) | http://localhost:8025 |
| MySQL | `localhost:3306` (utilisateur `root`, mot de passe `root`) |

> Les ports **3000, 8000, 8025, 3306 et 1025** doivent être libres (arrêtez un MySQL local éventuel).

### Prérequis par système

#### Windows
1. **Windows 10 (21H2+) ou 11**, virtualisation activée dans le BIOS.
2. **WSL 2** : dans PowerShell administrateur, `wsl --install`, puis redémarrer.
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** avec le moteur WSL 2 (Settings → General → *Use the WSL 2 based engine*).
4. **[Git for Windows](https://git-scm.com/download/win)**.

> **Recommandé** : cloner le projet **dans WSL** (terminal Ubuntu, dossier `~/`) plutôt que sur `C:\`. Les fichiers y sont bien plus rapides et le rechargement à chaud du site fonctionne. Si le projet est sur `C:\`, redémarrez le conteneur frontend après chaque modification (voir [Dépannage](#dépannage)).

#### macOS
1. **[Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop/)** (Apple Silicon ou Intel).
2. **Git** : `xcode-select --install` (ou via [Homebrew](https://brew.sh) : `brew install git`).

> Sur Apple Silicon (M1 à M4), l'image MailHog n'existe qu'en x86 : Docker l'exécute en émulation, c'est normal (un avertissement « platform » peut s'afficher).

#### Linux
1. **Docker Engine** et le plugin **Compose** — [documentation officielle](https://docs.docker.com/engine/install/) (Ubuntu : paquets `docker-ce` et `docker-compose-plugin`).
2. Utiliser Docker sans `sudo` : `sudo usermod -aG docker $USER`, puis se déconnecter / reconnecter.
3. **Git** : `sudo apt install git` (ou l'équivalent de votre distribution).

### Étapes d'installation (tous systèmes)

Les commandes ci-dessous se lancent dans un terminal : **Terminal** (macOS), terminal Linux, **Ubuntu / WSL** ou **Git Bash** (Windows). Les équivalents PowerShell sont indiqués quand ils diffèrent.

**1. Cloner le dépôt**
```bash
git clone https://github.com/Rteix05/academie-esic.git
cd academie-esic
git switch develop
```

**2. Créer la configuration du backend**
```bash
cp backend/.env.example backend/.env
# PowerShell : Copy-Item backend/.env.example backend/.env
```
Puis ouvrir `backend/.env` et modifier ces lignes :

```dotenv
APP_SECRET=<chaîne aléatoire, voir ci-dessous>
DATABASE_URL="mysql://root:root@db:3306/academie_esic?serverVersion=8.0.46&charset=utf8mb4"
JWT_PASSPHRASE=<chaîne aléatoire>
JWT_COOKIE_SECURE=0          # obligatoire en local (http://localhost)
VIDEO_TOKEN_SECRET=<chaîne aléatoire de 32 caractères minimum>
FIXTURES_ADMIN_PASSWORD=<mot de passe du compte admin de démo, 12 caractères minimum>
```
Pour générer une chaîne aléatoire : `openssl rand -hex 32` (macOS / Linux / Git Bash), ou après l'étape 3 : `docker compose exec backend php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`.

Les clés **Stripe** (`sk_test_…`) sont facultatives en local : sans elles, le paiement affiche simplement « momentanément indisponible ».

**3. Démarrer les conteneurs**
```bash
docker compose up -d --build
```
Le premier démarrage télécharge les images et installe les dépendances du frontend (quelques minutes).

**4. Installer le backend, créer les clés JWT et la base**
```bash
docker compose exec backend composer install
docker compose exec backend php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
```

**5. (Facultatif) Charger des données de démonstration**
```bash
docker compose exec backend php bin/console doctrine:fixtures:load --no-interaction
```
Crée des formations, des masterclass et un compte administrateur `admin@esic.fr` (mot de passe : `FIXTURES_ADMIN_PASSWORD`). ⚠️ Cette commande **vide la base** avant de la remplir.

**6. Ouvrir le site** : http://localhost:3000 — back-office : http://localhost:8000/admin.

---

## Au quotidien

```bash
docker compose up -d                      # démarrer
docker compose stop                       # arrêter (les données sont conservées)
docker compose logs -f frontend           # suivre les journaux (frontend, backend, db…)
docker compose restart frontend           # appliquer une modification du frontend (Windows hors WSL)

docker compose exec backend php bin/console doctrine:migrations:migrate   # après un « git pull »
docker compose exec backend php bin/console cache:clear                   # vider le cache Symfony
docker compose exec backend php bin/console app:email:preview vous@exemple.fr
                                           # un exemplaire de chaque email → visible sur http://localhost:8025
```

- **Emails** : en local, tous les emails sont capturés par MailHog (http://localhost:8025) ; aucun n'est réellement envoyé.
- **Paiements** : avec des clés Stripe de test, utilisez la carte `4242 4242 4242 4242` (date future, n'importe quel CVC). Pour recevoir les webhooks en local : [Stripe CLI](https://docs.stripe.com/stripe-cli) (`stripe listen --forward-to localhost:8000/api/stripe/webhook`).
- **Informations légales** (forme juridique, siège, SIREN, médiateur…) : à renseigner dans `frontend/src/lib/legalInfo.ts` ; tant qu'elles manquent, les CGU / CGV affichent des repères « À compléter ».
- **Workflow Git** : branches `feature/*` créées depuis `develop`, fusion par pull request — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Tests et qualité

```bash
# Backend : préparation de la base de test (une seule fois), puis tests
docker compose exec backend php bin/console doctrine:database:create --env=test --if-not-exists
docker compose exec backend php bin/console doctrine:schema:create --env=test
docker compose exec backend php bin/phpunit

# Frontend : typage et lint
docker compose exec frontend npx tsc --noEmit
docker compose exec frontend npm run lint
```

La CI GitHub Actions rejoue ces vérifications (et un build de production) sur chaque pull request ; `main` et `develop` sont protégées : fusion uniquement par pull request avec la CI verte.

---

## Dépannage

| Problème | Solution |
|---|---|
| Une modification du frontend n'apparaît pas (Windows, projet sur `C:\`) | `docker compose restart frontend`, ou cloner le projet dans WSL |
| `Error: ... port is already allocated` | Un autre programme utilise le port (souvent un MySQL local sur 3306) : l'arrêter ou changer le port dans `docker-compose.yml` |
| L'API renvoie une erreur 500 après installation | Vérifier `docker compose exec backend composer install` et les clés JWT (étape 4), puis `docker compose logs backend` |
| Connexion impossible en local | `JWT_COOKIE_SECURE=0` dans `backend/.env` (le cookie sécurisé exige https) |
| `entrypoint.sh: not found` (Windows) | Le fichier a pris des fins de ligne Windows : `git config core.autocrlf input`, puis `git checkout -- docker/node/entrypoint.sh` et `docker compose up -d --build` |
| Linux : fichiers de `backend/var` non modifiables | Ils ont été créés par le conteneur (root) : `sudo chown -R $USER:$USER backend/var` |
| Disque plein | `docker system prune` (conteneurs arrêtés, cache de build) ; supprimer `frontend/.next/dev/cache` (se reconstruit) |
| Tout réinitialiser (⚠️ supprime la base locale) | `docker compose down -v`, puis reprendre à l'étape 3 |
