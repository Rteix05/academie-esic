# Académie E.S.I.C. — Frontend

Site public de l'Académie E.S.I.C. (Next.js 16, React 19, TypeScript, Tailwind CSS).

La présentation du projet, l'installation (Windows, macOS, Linux) et les commandes du quotidien sont décrites dans le **[README principal](../README.md)**.

## Repères

| Dossier / fichier | Rôle |
|---|---|
| `src/app/` | Pages (App Router) |
| `src/components/catalog/` | Catalogue façon plateforme de contenu (hero, carrousels, fiches) |
| `src/components/ProtectedVideoPlayer.tsx` | Lecteur vidéo protégé (filigrane, consentement aux lecteurs tiers) |
| `src/components/A11yPreferences.tsx` | Réglages d'affichage (taille du texte, gras) |
| `src/components/PurchaseConsent.tsx` | Cases CGV et accès immédiat avant paiement |
| `src/lib/api.ts` | Client de l'API Symfony (cookie de session httpOnly) |
| `src/lib/legalInfo.ts` | Informations légales affichées dans les CGU / CGV |
| `scripts/generate-email-icons.mjs` | Icônes Lucide des emails (PNG pour le backend) |

Variable d'environnement : `NEXT_PUBLIC_BACKEND_URL` — URL publique de l'API (`http://localhost:8000` en local, fournie par `docker-compose.yml`).

> Cette version de Next.js comporte des changements importants : consultez la documentation embarquée dans `node_modules/next/dist/docs/` avant de modifier le code (voir `AGENTS.md`).
