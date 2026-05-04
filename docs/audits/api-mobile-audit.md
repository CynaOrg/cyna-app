# Audit `cyna-api` — endpoints mobile-relevant

> Document de travail intermédiaire. Sera fold dans `mobile-native-audit.md` (L1) puis supprimé.

## 1. Vue d'ensemble

- Source : `/Users/tom/Documents/projetsCours/Cyna/cyna-workspace/cyna-api/openapi.json`
- **94 opérations OpenAPI** (entre 94 et 101 selon comptage du schema.ts client)
- Architecture microservices NestJS + RabbitMQ derrière un API Gateway
- Couverture fonctionnelle évaluée à partir des endpoints visibles dans le contrat

## 2. Endpoints OK pour mobile (sans modification)

### Auth user (parfaitement adapté mobile)
- `POST /auth/register` ✅
- `POST /auth/login` ✅
- `POST /auth/logout` ✅
- `POST /auth/refresh-token` ✅
- `POST /auth/verify-email` ✅
- `POST /auth/forgot-password` ✅
- `POST /auth/reset-password` ✅
- `POST /auth/resend-verification` ✅

L'AuthStore/AuthInterceptor de l'app utilise déjà ces endpoints avec succès en mode WebView (tokens stockés via Capacitor Preferences). Pas de modification nécessaire.

### Profil utilisateur
- `GET /profile`, `PATCH /profile`, `PATCH /profile/password`, `PATCH /profile/language`, `DELETE /profile/delete` ✅

### Catalogue
- `GET /catalog/categories`, `GET /catalog/products`, `GET /catalog/products/featured`, `GET /catalog/search` ✅
- Performance < 500ms cadrée — à vérifier sur 4G simulée

### Panier (déjà cohérent mobile)
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items`, `DELETE /cart/items` ✅
- `POST /cart/merge` ✅ — **excellent pour mobile** : permet de merger un panier guest avec le panier user à la connexion (cas d'usage : ajout au panier sans login → login → merge auto)

### Commandes et abonnements
- `GET /orders`, `GET /orders/{id}`, `GET /orders/{id}/invoice` ✅
- `GET /subscriptions`, actions cancel/pause/resume ✅

### Paiement
- `POST /checkout/payment-intent` ✅ — utilisé pour Stripe Payment Element web et compatible Apple Pay (Apple Pay est résolu côté frontend Stripe.js, le backend reçoit le même `payment_method_id`)
- `POST /webhooks/stripe` ✅ — gère les webhooks (succès, échec, renouvellement)

### Contenu et statique
- `GET /content/carousel`, `/content/homepage`, `/content/top-products`, `/content/top-services` ✅
- `POST /content/contact` ✅ — formulaire de contact

### Licences et autres
- `GET /licenses`, `POST /licenses/activate` ✅

### Health
- `GET /health`, `/ready`, `/live` ✅

## 3. Endpoints nécessitant modification éventuelle

### Aucun en cas standard

L'audit ne révèle **aucun endpoint qui doive être modifié** pour supporter les fonctionnalités natives validées (Face ID, Apple Pay, deep linking, share, offline) :

- **Face ID / Touch ID** : ne nécessite **aucun endpoint backend dédié**. La biométrie est purement locale (iOS Local Authentication framework via `@capacitor-community/biometric-auth`). Le pattern : après biométrie réussie, on récupère le refresh token stocké localement et on appelle `/auth/refresh-token`.
- **Apple Pay** : géré côté Stripe.js. Le backend reçoit le même `payment_method_id` qu'avec une CB classique. `/checkout/payment-intent` reste inchangé.
- **Deep linking / Universal Links** : les routes ciblent des ressources existantes (`/products/{slug}`, `/orders/{id}`). Pas de modification backend.
- **Share** : pas d'API backend, juste `navigator.share` côté frontend.
- **Mode hors-ligne minimal** : pas de modification backend ; le frontend cache localement les produits et le panier.

## 4. Endpoints manquants à envisager

### Aucun en P0/P1

Aucun endpoint manquant n'est strictement requis pour les fonctionnalités natives validées.

### P2 — bonus possibles

Si on veut une UX mobile plus polish, on pourrait envisager (à valider) :

- `POST /devices/register-token` — enregistrer un device id mobile pour push notifications futures (HORS scope V1, donc à ignorer)
- `GET /catalog/products?since=<timestamp>` — sync incrémentielle pour le mode offline (overkill pour MVP, le cache court suffit)

**Conclusion** : on ne touche **pas** au backend pour ce sous-projet mobile.

## 5. Points d'attention identifiés

### Token storage : Capacitor Preferences ≠ Keychain

L'app stocke les tokens via `@capacitor/preferences` qui mappe sur **NSUserDefaults** sur iOS, pas sur le **Keychain**. NSUserDefaults n'est pas chiffré au repos.

Pour un MVP démo soutenance c'est acceptable (les tokens sont des JWT courts + refresh tokens éphémères). En revanche pour une éventuelle production, migrer vers `@capacitec-community/secure-storage` ou un wrapper Keychain serait plus prudent.

→ **Décision** : on documente le risque, on ne migre pas dans ce sous-projet (hors scope MVP).

### Refresh token côté backend

`POST /auth/refresh-token` existe et fonctionne en mode WebView mobile (testé via AuthStore). Pas de divergence vs le web.

### Webhooks Stripe

Les webhooks restent côté backend (cyna-api). L'app mobile ne s'occupe que de confirmer le `payment-intent` côté Stripe.js. Aucun impact mobile.

### CORS / domaines autorisés

À vérifier rapidement dans la config de l'API Gateway : la WebView Capacitor sur iOS utilise le scheme `capacitor://localhost` par défaut. Si CORS du backend est strict, il faudra autoriser ce scheme. À tester pendant le sous-projet 3 (premier vrai run iOS authentifié).

## 6. Synthèse

- ✅ **Backend `cyna-api` est mobile-ready** sur tout le scope cadré
- ✅ Aucun endpoint à modifier ou ajouter pour les features natives validées
- ⚠️ Un seul point d'attention runtime : **CORS pour `capacitor://localhost`** à valider lors du premier login mobile authentifié
- ℹ️ Note sécurité long-terme : NSUserDefaults vs Keychain, hors scope MVP
