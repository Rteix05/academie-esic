#!/bin/sh
set -e

# Entrypoint: installe les dépendances si `node_modules` est absent puis exécute la commande
cd /app || exit 1

if [ ! -d node_modules ] || [ "$(ls -A node_modules 2>/dev/null)" = "" ]; then
  echo "node_modules manquant — installation des dépendances..."
  npm ci --legacy-peer-deps
fi

exec "$@"
