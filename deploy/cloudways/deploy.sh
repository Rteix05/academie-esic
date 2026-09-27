#!/usr/bin/env bash
# Déploiement du backend Symfony sur Cloudways — à lancer en SSH après chaque « git pull ».
#   bash deploy/cloudways/deploy.sh
#
# Prérequis (une seule fois) : backend/.env.local rempli à partir de deploy/cloudways/env.prod.example
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/backend"

if [[ ! -f .env.local && ! -f .env.local.php ]]; then
  echo "backend/.env.local est absent : copiez deploy/cloudways/env.prod.example et remplissez-le." >&2
  exit 1
fi

# .env n'est pas versionné : le modèle sert de base, .env.local (prod) le surcharge
[[ -f .env ]] || cp .env.example .env

export APP_ENV=prod APP_DEBUG=0

echo "→ Dépendances (sans les outils de dev)"
composer install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction --no-progress

echo "→ Compilation des variables d'environnement (.env.local.php, plus rapide et sans parsing à chaque requête)"
rm -f .env.local.php
composer dump-env prod

echo "→ Dossiers de fichiers téléversés"
mkdir -p public/uploads/images private/uploads/pdfs private/uploads/videos var/log

echo "→ Clés JWT (créées au premier déploiement uniquement)"
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

echo "→ Base de données"
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "→ Assets (back-office EasyAdmin)"
php bin/console assets:install public --no-interaction
php bin/console asset-map:compile --no-interaction

echo "→ Cache"
php bin/console cache:clear --no-warmup
php bin/console cache:warmup

echo "✓ Déploiement terminé"
