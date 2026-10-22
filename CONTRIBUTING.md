# Workflow Git (gitflow)

| Branche | Rôle | Créée depuis | Fusionnée dans |
|---|---|---|---|
| `main` | Production : chaque commit est déployable (Cloudways / Vercel) | — | — |
| `develop` | Intégration : prochaine version en préparation (branche par défaut) | `main` | `main` via une release |
| `feature/<sujet>` | Une fonctionnalité ou correction | `develop` | `develop` (pull request) |
| `release/<version>` | Stabilisation avant mise en production | `develop` | `main` **et** `develop` |
| `hotfix/<sujet>` | Correction urgente en production | `main` | `main` **et** `develop` |

## Au quotidien

```bash
# Nouvelle fonctionnalité
git switch develop && git pull
git switch -c feature/formulaire-contact
# … commits …
git push -u origin feature/formulaire-contact
# puis pull request feature/formulaire-contact → develop
```

```bash
# Mise en production
git switch develop && git pull
git switch -c release/1.1.0
(cd frontend && npm version 1.1.0 --no-git-tag-version)   # version affichée dans le pied de page
git commit -am "Version 1.1.0"
# derniers correctifs, puis pull request release/1.1.0 → main
# après fusion : tag v1.1.0 sur main et report de main dans develop
```

Avec l'extension [git-flow](https://github.com/petervanderdoes/gitflow-avh), les mêmes étapes s'écrivent
`git flow feature start <sujet>`, `git flow release start <version>`, `git flow hotfix start <sujet>`.

## Numéro de version

La version du site est celle du champ `version` de `frontend/package.json` : elle est affichée dans le pied de page de toutes les pages.
Elle est mise à jour au début de chaque `release/*` (ex. 1.0.0 → 1.1.0) et de chaque `hotfix/*` (ex. 1.1.0 → 1.1.1),
selon le [versionnage sémantique](https://semver.org/lang/fr/), et correspond au tag `vX.Y.Z` posé sur `main`.

## Règles

- Jamais de commit direct sur `main` ni sur `develop` : tout passe par une pull request.
- La CI (backend, frontend, GitGuardian) doit être verte avant de fusionner.
- Noms de branches en minuscules, mots séparés par des tirets : `feature/paiement-paypal`.
