# Mise en production

Architecture cible :

| Domaine | Hébergement | Contenu |
|---|---|---|
| `academie-esic.fr` | Vercel | Frontend Next.js (Cloudways n'exécute pas Node.js) |
| `api.academie-esic.fr` | Cloudways | API Symfony, back-office `/admin`, fichiers téléversés |

Les deux domaines partagent le même site (`academie-esic.fr`) : le cookie de session httpOnly en `SameSite=Lax` fonctionne sans configuration particulière.

## 1. Cloudways (backend)

1. **Serveur** : PHP 8.2 ou plus récent, **MySQL 8.0** de préférence (identique au développement ; MariaDB 10.6+ est compatible).
2. **Application** : type « Custom PHP ».
   - Application Settings → **Webroot** : `public_html/backend/public`
   - Application Settings → **Varnish : désactivé** (il pourrait servir des réponses d'API en cache)
   - Extensions PHP requises : `intl`, `pdo_mysql`, `zip`, `sodium` (Settings & Packages)
3. **Domaine** : `api.academie-esic.fr` (enregistrement DNS A vers l'IP du serveur), puis **SSL Certificate → Let's Encrypt** et redirection HTTPS forcée.
4. **Code** : Deployment via Git → dépôt GitHub, branche `main`, chemin `public_html`.
5. **Configuration** (SSH, une seule fois) :
   ```bash
   cd applications/<app>/public_html
   cp deploy/cloudways/env.prod.example backend/.env.local
   nano backend/.env.local   # remplir chaque « À_REMPLIR »
   ```
6. **Déploiement** (après chaque pull) :
   ```bash
   bash deploy/cloudways/deploy.sh
   ```
   Le script installe les dépendances sans les outils de dev, compile la configuration, génère les clés JWT au premier passage, applique les migrations, installe les assets du back-office et préchauffe le cache.
7. **Premier administrateur** : créer un compte via le site, puis lui attribuer `ROLE_ADMIN` :
   ```bash
   mysql -e "UPDATE user SET roles='[\"ROLE_ADMIN\"]' WHERE email='…'" <base>
   ```

Pas de worker Messenger ni de tâche cron à prévoir : les emails partent de façon synchrone.

## 2. Vercel (frontend)

- Nouveau projet depuis le dépôt GitHub, **Root Directory : `frontend`**.
- Variable d'environnement (Production) : `NEXT_PUBLIC_BACKEND_URL=https://api.academie-esic.fr`.
  Elle est intégrée au moment du build : il faut redéployer après l'avoir modifiée.
- Domaines : `academie-esic.fr` (principal) et `www.academie-esic.fr` redirigé vers l'apex.

## 3. Services externes

- **Stripe** (mode live) : webhook `https://api.academie-esic.fr/api/stripe/webhook` avec les événements `checkout.session.completed`, `checkout.session.async_payment_succeeded` et `checkout.session.expired` ; reporter le secret `whsec_…` dans `.env.local`.
- **SMTP** : Brevo, Mailjet ou l'add-on Elastic Email de Cloudways. Authentifier le domaine (SPF, DKIM, DMARC), sinon les emails de réinitialisation tomberont en spam.

## 4. Sauvegardes

- Cloudways → Backups : sauvegarde quotidienne du serveur (base + fichiers).
- À sauvegarder impérativement : la base, `backend/public/uploads/` (images), `backend/private/` (PDF et vidéos payants) et `backend/config/jwt/`.

## 5. Vérifications après mise en ligne

- `https://api.academie-esic.fr/api/formations` renvoie 200 ; une URL inconnue renvoie une erreur JSON sans trace.
- Connexion depuis le site : le cookie `BEARER` porte les attributs `Secure`, `HttpOnly` et `SameSite=Lax`.
- Paiement test : un achat réel à petit prix, puis remboursement depuis Stripe.
- Mot de passe oublié : l'email arrive bien dans la boîte de réception.
