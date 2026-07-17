FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers package pour installer les dépendances lors du build
COPY frontend/package*.json ./

# Installer les dépendances au build pour profiter du cache
RUN npm ci --legacy-peer-deps || true

# Copier le reste des sources (en dev le volume les remplace)
COPY frontend/ ./

# Copier l'entrypoint qui vérifie/installe les dépendances au démarrage
COPY docker/node/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

# Lancer next en mode développement, écoute sur 0.0.0.0
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]