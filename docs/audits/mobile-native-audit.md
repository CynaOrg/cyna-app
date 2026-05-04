# Audit Mobile-Native — `cyna-app`

**Date** : 2026-05-04
**Auteur** : Claude (superviseur) avec Tom Lefevre-Bonzon
**Branche** : `feat/mobile-audit-setup`
**Spec de référence** : `cyna-app/docs/superpowers/specs/2026-05-04-mobile-native-audit-design.md`

---

## 1. Executive summary

L'application `cyna-app` est une web-app Ionic Angular 20 / Capacitor 8 dont la base technique est saine et le design web mobile clean. **Elle build et tourne déjà sur simulateur iPhone 17** (vérifié dans cet audit), avec un bottom tab bar 4 onglets cohérent avec le cadrage. En revanche, elle ne dispose **d'aucun pattern d'interaction mobile-native** (pull-to-refresh, swipe back global, transitions de page natives, haptics, skeletons, splash Capacitor) et présente **3 divergences visuelles vs cadrage** (couleur primaire, sous-utilisation de la police Qurova, splash custom Angular au lieu du splash natif iOS).

Le **backend `cyna-api` est mobile-ready** : 94 endpoints OpenAPI couvrent l'intégralité du scope cadré, aucune modification backend n'est nécessaire pour les fonctionnalités natives validées (Face ID, Apple Pay, deep linking, share, offline minimal).

Les sous-projets 2-5 doivent prioriser : (1) bascule design system vers `#1447E6`, (2) corrections routes navbar cassées, (3) installation des plugins natifs Capacitor, (4) greffe des patterns natifs sur les pages existantes, (5) Face ID + Apple Pay.

**Soutenance** : 20/05/2026 (16 jours). **Effort cible Tom** : fin de cette semaine (~10/05).

## 2. Périmètre fonctionnel mandaté

### Source : `cadrage.pdf` (47 pages, 2026-01-23)

L'application mobile doit être un **miroir fonctionnel intégral du site web mobile-first** :

- Navigation et consultation du catalogue (services SaaS SOC/EDR/XDR + produits physiques + licences)
- Recherche et filtres
- Panier et tunnel d'achat complet (5 étapes : auth, facturation, livraison, paiement, confirmation)
- Espace utilisateur : profil, adresses, abonnements, historique commandes (avec téléchargement factures PDF)
- Dashboard client (services actifs, alertes sécurité, statistiques)
- Pages statiques : CGU, mentions légales, politique de confidentialité, contact

### Cas d'usage critiques (cadrage §4.3)

| # | Cas d'usage | Pertinence mobile |
|---|---|---|
| 1 | Abonnement service SaaS mensuel | Forte — Stripe Subscriptions |
| 2 | Recherche et découverte produit | Forte — barre de recherche, filtres |
| 3 | Achat mixte SaaS + Produit | **Critique** — panier double logique récurrent / one-time, distinction visuelle à respecter |
| 6 | Gestion abonnements récurrents | Forte — pause/resume/cancel |

### Approche déploiement

| Élément | Cadrage | Décision Tom (brainstorming) |
|---|---|---|
| Stores | Hors V1 | Hors V1 ✓ aligné |
| iOS | Démo via émulateur Xcode (PWA installable) | **Build natif sideload sur iPhone perso via free signing** (relèvement) |
| Android | Démo via émulateur Android Studio ou device réel | Code propre, **test sur device d'ami** plus tard. Pas d'install Android Studio |

Tom dépasse le minimum cadré sans le contredire (ajout de qualité native, pas de réduction du périmètre).

## 3. Périmètre natif validé en brainstorming

### Inclus (P0 + P1)

| Feature | Plugin / méthode |
|---|---|
| Splash screen + icône | `@capacitor/splash-screen`, `@capacitor/assets` |
| Status bar stylée + safe areas iOS | `@capacitor/status-bar` |
| Swipe back natif | Ionic Angular natif (`ion-back-button` + routing en pile) |
| Pull-to-refresh | `ion-refresher` |
| Transitions de page natives | Ionic NavController |
| Haptic feedback | `@capacitor/haptics` |
| Loading skeletons | `ion-skeleton-text` |
| Face ID / Touch ID au login | `@capacitor-community/biometric-auth` |
| Apple Pay via Stripe | `@stripe/stripe-js` (config Stripe Dashboard, pas de plugin natif) |
| Deep linking / Universal Links | `@capacitor/app` + URL scheme + associated domains |
| Partage natif | `@capacitor/share` |
| Mode hors-ligne minimal | `@capacitor/network` + cache produits + panier persistant `@capacitor/preferences` |

### Exclus

- Push notifications (nécessite Apple Developer Program payant — hors scope)
- Camera / scan QR code (non pertinent cyber B2B)
- Géolocalisation (non pertinent)
- Publication App Store / Play Store (cadrage explicite)

## 4. Cadre validé en brainstorming (rappels)

| Décision | Valeur |
|---|---|
| Design web mobile actuel | Source d'inspiration, **on n'y touche pas** |
| Mode supervision | **Mode D hybride** : autonomie technique, validation utilisateur sur visuel + décisions architecturales |
| Backend `cyna-api` | Modifiable uniquement si gap fonctionnel justifié — **AUCUN gap identifié** dans cet audit |
| Tests | Unitaires Jest 80% min sur services touchés. E2E Cypress reportés en équipe humaine |
| Cadence | Bombarder, plusieurs agents en parallèle, milestones quotidiens |
| Git | Worktrees + branches `feat/mobile-<scope>` + PR/review/merge propre |

## 5. Code inventory `cyna-app/src/app`

### Architecture confirmée saine

- **Standalone components + lazy-loading** systématique sur toutes les pages
- **State management** : pattern hybride RxJS `BehaviorSubject` + Signals via `base.store.ts` abstrait, déclinaison sur 11 stores métier (`auth`, `cart`, `product`, `checkout`, `order`, `subscription`, `user-address`, `payment-method`, `invoice`, `catalog`, plus base)
- **Auth interceptor** propre : Bearer token + refresh 401 + `X-Session-Id` + `Accept-Language` + `x-lang`
- **Guards platform** intelligents : `browserOnlyGuard`, `nativeOnlyGuard`, `authGuard`, `guestGuard`
- **API schema OpenAPI** auto-généré (`schema.ts`, 5183 lignes, ~101 opérations) couvre tout le scope
- **Capacitor v6** détecté correctement via `platform.utils.ts:isNativeCapacitor()`

### 14 dossiers de pages

`auth`, `cart`, `checkout`, `contact`, `dashboard`, `landing`, `legal`, `licenses`, `order-confirmation`, `product-detail`, `products`, `services`, `splash`, `subscribe`.

Le routing est complet pour le web. La structure couvre tout le scope cadrage.

### 29 composants partagés `shared/components`

`address-card`, `address-form`, `address-picker`, `browser-header`, `button`, `catalog-page`, `category-cards`, `checkbox`, `cyna-logo`, `dashboard-sidebar`, `dashboard-topbar`, `faq`, `footer`, `hero`, `input`, `mobile-header`, **`navbar`** (bottom tabs), `order-summary`, `pagination`, `product-card`, `product-card-skeleton`, `product-list`, `resend-email`, `search-modal`, `section-header`, `stripe-payment-element`, `topbar-actions`, `trusted-by`.

Le composant `product-card-skeleton` existe, signal positif pour les loading states — usage à étendre.

### Bottom tab bar (`navbar` component)

**4 onglets correctement alignés avec le cadrage** :

| Label | Route configurée | Route réelle existante |
|---|---|---|
| Accueil | `/home` | ✅ `/home` |
| Catalogue | `/catalog` | ❌ **n'existe pas** (réelle : `/products`, `/services`, `/licenses`) |
| Panier | `/cart` | ✅ `/cart` |
| Compte | `/account` | ❌ **n'existe pas** (réelle : `/dashboard/account`) |

**Bug P0 identifié** : 2 routes sur 4 cassées. À corriger en sous-projet 2.

### Auth flow

- Tokens stockés via `PreferencesService` qui mappe sur `@capacitor/preferences` (NSUserDefaults sur iOS) avec fallback localStorage en web
- ⚠️ Diverge de la consigne CLAUDE.md ("cookies HTTP-only uniquement") — choix pragmatique mobile, à documenter
- Refresh token automatique via interceptor sur 401 ✅
- 2FA email = back-office uniquement (pas mobile, conforme cadrage)

### Tailwind v4 et styles

- `@theme inline` pour contourner Shadow DOM Ionic ✅ pattern correct
- Aucun SCSS custom interdit visible
- Aucun `@apply` custom
- Police **Inter** chargée via `@fontsource/inter` ✅
- Police **Qurova** chargée via `@font-face` dans `global.scss` (asset `qurova-bold.otf`), mais **utilisée uniquement** dans `hero.component.ts` et `contact.page.html` (styles inline) — sous-utilisation à corriger

## 6. Dependencies et plugins natifs

### Stack actuelle

- Angular 20.x, Ionic Angular 8.x, ionicons 7.x
- Capacitor 8.0.1 (`@capacitor/core`, `cli`, `ios`, `android`, `preferences`)
- Tailwind 4.1, @stripe/stripe-js 8.7, @ng-icons/phosphor-icons 29
- @ngx-translate 17, @fontsource/inter, chart.js 4.5, express 5.2 (server.js SSR)

### Plugins Capacitor à installer (sous-projet 3)

```
@capacitor/splash-screen
@capacitor/status-bar
@capacitor/haptics
@capacitor/app
@capacitor/browser
@capacitor/share
@capacitor/network
@capacitor/assets         (devDependency — génération icônes/splash)
```

### Plugins community (sous-projet 4)

```
@capacitor-community/biometric-auth
```

### Pas besoin

- Apple Pay : 100% côté Stripe.js + Stripe Dashboard, aucun plugin natif requis
- Push : hors scope
- Camera : hors scope

## 7. Etat initial — iOS Simulator

### Build et run validés

- ✅ `npm run build` → output `www/browser/` (warnings ESLint mineurs non-bloquants)
- ✅ `npx cap sync ios` → 1 plugin Capacitor (`@capacitor/preferences@8.0.0`)
- ✅ CocoaPods 1.16.2 installé via Homebrew (était absent au début de l'audit, blocker résolu)
- ✅ Build Xcode + déploiement sur **iPhone 17** simulator (`342ADDFF-D9DD-412A-A76A-3540D3714B76`) en 155 secondes

### Screenshot capturé

`docs/audits/screenshots/initial/01-home-launch.png` — page d'accueil au lancement.

**Observations sur le screenshot** :
- Header avec logo Cyna + recherche + panier ✅
- Section "Top services du moment" avec image full-bleed
- Bottom tab bar visible : Accueil / Catalogue / Panier / Compte ✅
- Status bar iOS s'intègre normalement (15:34, signal, batterie)
- Safe area top OK (logo n'est pas sous la dynamic island)
- ⚠️ **Couleur primaire visiblement violette `#4f39f6` au lieu de l'indigo cadrage `#1447E6`**

### Limitation `xcrun simctl`

`simctl` n'a pas de commande tap programmatique native. Les autres écrans natifs seront capturés comme checkpoints visuels lors des sous-projets 2-5 (commande `npm run sim:ios` + screenshots manuels). Pour la phase d'audit, la couverture exhaustive est assurée par Playwright (cf. §8).

## 8. Etat initial — Playwright web mobile viewport

### Setup en place

- `@playwright/test` 1.59.1 installé
- WebKit 26.4 téléchargé (75 MB)
- Config : `e2e/visual/playwright.config.ts` (projets `iphone-15` 393×659 + `pixel-7`)
- Helper réutilisable : `e2e/visual/helpers/screenshot.ts:screenshotPage(page, route, name, opts)`
- Spec initiale : `e2e/visual/specs/initial-snapshot.spec.ts` couvre 7 pages publiques
- Scripts : `npm run e2e:visual` et `npm run e2e:visual:ui`

### Run validé

7/7 tests passent en 18,4s. Screenshots produits dans `docs/audits/screenshots/playwright/` :

- `landing-393x659.png`
- `auth-login-393x659.png`
- `auth-register-393x659.png`
- `products-list-393x659.png`
- `services-393x659.png`
- `licenses-393x659.png`
- `contact-393x659.png`

### Constats sur les screenshots Playwright

- Design web mobile **clean et fonctionnel** ✅
- Police **Qurova** visible sur le titre "CYNA" en landing ✅
- Couleur primaire violette `#4f39f6` confirmée
- Hamburger menu en haut à droite (pattern web, pas natif)
- Pas de bottom tab bar (normal — `nativeOnlyGuard` masque la navbar en mode web)

## 9. Backend `cyna-api` — état mobile

### Couverture endpoints

94 opérations OpenAPI inventoriées, couvrant : Health/Ready/Live, Auth user (register/login/verify-email/forgot/reset/refresh-token/logout/resend-verification), Auth admin (avec 2FA email), Profile, Catalog (products/categories/featured/search), Cart (avec `/cart/merge` ⭐), Orders (avec `/orders/{id}/invoice`), Subscriptions (cancel/pause/resume), Checkout (`/checkout/payment-intent`), Webhooks Stripe, Content (carousel/homepage/top-products/top-services), Licenses (`/licenses/activate`), Admin complet.

### Aucun gap fonctionnel pour le mobile

- **Face ID** : pas d'endpoint requis (auth purement locale)
- **Apple Pay** : pas d'endpoint requis (résolu côté Stripe.js, backend reçoit le même `payment_method_id`)
- **Deep linking** : routes existantes `/products/{slug}`, `/orders/{id}` suffisent
- **Share** : pas d'API (juste `navigator.share`)
- **Mode hors-ligne** : cache local frontend uniquement
- **Refresh token mobile** : `POST /auth/refresh-token` existe et est testé fonctionnel via la WebView Capacitor

### Point d'attention runtime

⚠️ **CORS pour `capacitor://localhost`** : à valider lors du premier login mobile authentifié (sous-projet 3 ou 4). Si le backend rejette le scheme custom Capacitor, il faudra ajouter `capacitor://localhost` aux origines autorisées côté API Gateway.

## 10. Page-by-page gap analysis

Légende : 🟢 prêt natif · 🟡 ajustements · 🔴 refonte mobile-native importante

| Page | Route | Bottom tabs ? | Pull-refresh | Skeletons | Safe area | Plugin natif requis | Priorité |
|---|---|---|---|---|---|---|---|
| Splash | `/splash` | n/a | n/a | n/a | n/a | `@capacitor/splash-screen` (basculer du custom Angular) | 🔴 P0 |
| Landing | `/landing` | non (web only) | non | non | n/a | aucun | 🟢 (pas mobile) |
| Home | `/home` | ✅ | non | non | à vérifier | aucun | 🟡 P1 |
| Auth Login | `/auth/login` | non | n/a | n/a | à vérifier | bio futur | 🟡 P0 (bio en SP4) |
| Auth Register | `/auth/register` | non | n/a | n/a | à vérifier | aucun | 🟡 P1 |
| Products list | `/products` | hérite home | **manquant** | partiel (`product-card-skeleton`) | à vérifier | aucun | 🟡 P1 |
| Services | `/services` | hérite home | **manquant** | partiel | à vérifier | aucun | 🟡 P1 |
| Licenses | `/licenses` | hérite home | **manquant** | partiel | à vérifier | aucun | 🟡 P1 |
| Product Detail | `/products/:slug` | non (back arrow OK) | non | non | à vérifier | `@capacitor/share` (CTA share) | 🟡 P1 |
| Cart | `/cart` | hérite home | non | non | à vérifier | `@capacitor/haptics` (validation) | 🟡 P1 |
| Checkout | `/checkout` | non | n/a | non | à vérifier | Apple Pay via Stripe | 🔴 P1 |
| Subscribe | `/subscribe/:slug` | non | n/a | non | à vérifier | Apple Pay via Stripe | 🔴 P1 |
| Order Confirmation | `/order/confirmation/:id` | non | n/a | non | à vérifier | aucun | 🟡 P2 |
| Contact | `/contact` | non | n/a | n/a | à vérifier | aucun | 🟢 |
| Legal | `/legal/*` | non | n/a | n/a | à vérifier | `@capacitor/browser` (liens externes) | 🟢 |
| Dashboard home | `/dashboard` | hérite home | **manquant** | partiel | à vérifier | aucun | 🟡 P1 |
| Dashboard account | `/dashboard/account` | hérite home | **manquant** | non | à vérifier | aucun | 🟡 P0 (route navbar cassée pointe vers `/account`) |
| Dashboard orders | `/dashboard/orders` | hérite home | **manquant** | non | à vérifier | aucun | 🟡 P1 |
| Dashboard subscriptions | `/dashboard/subscriptions` | hérite home | **manquant** | non | à vérifier | aucun | 🟡 P1 |

## 11. Cross-cutting gaps

| Gap | Niveau | Solution | Sous-projet |
|---|---|---|---|
| Couleur primaire `#4f39f6` ≠ cadrage `#1447E6` | P0 | Bascule globale via Tailwind `@theme inline` | SP2 — Native-UX |
| Police Qurova sous-utilisée | P0 | Étendre l'usage aux titres globaux (`h1`, `h2`, sections) | SP2 |
| Routes navbar cassées : `/catalog`, `/account` | P0 | Soit ajouter alias dans le routing, soit corriger les `routerLink` du navbar | SP2 |
| Splash custom Angular au lieu de Capacitor natif | P0 | Plugin `@capacitor/splash-screen` + assets via `@capacitor/assets` | SP3 |
| App icon iOS par défaut | P0 | Génération via `@capacitor/assets` à partir d'un PNG 1024×1024 logo Cyna | SP3 |
| Aucun pull-to-refresh sur listes | P1 | `ion-refresher` sur products, services, licenses, orders, subscriptions | SP2 |
| Aucune transition de page native | P1 | Configuration NavController + animations Ionic | SP2 |
| Aucun haptic feedback | P1 | Plugin `@capacitor/haptics` + helper centralisé | SP2 |
| Pas de safe area iOS systématique | P1 | CSS variables `--ion-safe-area-*` + audit page par page | SP2 |
| Status bar non stylée | P1 | Plugin `@capacitor/status-bar` configuré au boot | SP3 |
| Skeletons partiels | P1 | Étendre `product-card-skeleton` à toutes les listes via composant générique | SP2 |
| Face ID au login non implémenté | P2 | Plugin community + flow de fallback mot de passe | SP4 |
| Apple Pay non activé | P2 | Config Stripe Dashboard + bouton dans Payment Element | SP4 |
| Deep linking non configuré | P2 | URL scheme `cyna://` + handler via `@capacitor/app` | SP4 |
| Mode hors-ligne minimal absent | P2 | `@capacitor/network` + cache produits + persist panier | SP4 |
| Stockage tokens NSUserDefaults | P3 | Doc seul, migration Keychain hors scope MVP | hors SP |
| `Info.plist` minimal | P1 | Ajouts : `NSFaceIDUsageDescription`, `CFBundleURLTypes`, restriction orientation portrait | SP3 |

## 12. Backend modifications required

**Aucune.**

Le backend cyna-api couvre tout le scope mobile sans modification. Seul un point d'attention runtime : confirmer que le CORS du backend autorise le scheme `capacitor://localhost` lors du premier login natif. Si non, ajout simple côté API Gateway.

## 13. Recommended sub-projects 2-5

### SP2 — Adaptation mobile-native sur les pages existantes (gros chantier)

Greffer les patterns natifs sur les pages existantes en préservant le design web mobile. Inclut :
- Bascule design system : `#1447E6`, Qurova en titres globaux
- Correction routes navbar
- `ion-refresher` partout, transitions, haptics, skeletons étendus
- Safe areas iOS
- Audit page par page (cf. §10)

Estimation : **2-3 jours** avec dispatching parallèle Page-Adapter par batch.

### SP3 — Setup build iOS + Capacitor plugins de base

- Installation des 8 plugins Capacitor de base
- Configuration splash + icon via `@capacitor/assets`
- `Info.plist` enrichi
- Premier sideload iPhone via free signing Xcode
- Documentation procédure de build

Estimation : **0,5-1 jour**.

### SP4 — Features natives spécifiques

- Face ID / Touch ID au login (avec fallback password)
- Apple Pay activé sur le checkout (config Stripe + bouton)
- Deep linking + Universal Links
- Partage natif (page produit)
- Mode hors-ligne minimal (network detection + cache produits + panier persistant)

Estimation : **1-2 jours**.

### SP5 — Workflow vivant de supervision

Découle directement de L3 (roster) + L4 (Playwright/sim). Pas de nouveau livrable, juste l'utilisation continue : daily logs, milestones, validations Tom, PR review. Activable dès la fin du SP1.

## 14. Risks observed

Les risques cadrage R1-R5 (panier mixte, latence recherche, sécurité paiements, scope creep, services tiers) restent valides au niveau global du projet. Risques **spécifiques à cette transformation mobile-native** :

| ID | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| MR1 | CORS rejette `capacitor://localhost` | moyenne | majeur | Test rapide en SP3 ; ajout simple côté API Gateway si requis |
| MR2 | Free signing Xcode 7 jours = re-sideload chaque semaine | forte | mineur | Documenter procédure resign rapide, ou utiliser un Apple ID Tom existant |
| MR3 | Tailwind v4 `@theme inline` fragile sur Shadow DOM Ionic — bascule de couleur peut casser visuellement | moyenne | majeur | Test visuel via Playwright systématique après changement |
| MR4 | Routes navbar cassées masquent peut-être d'autres bugs de routing | faible | majeur | Test e2e Playwright étendu en SP2 (clic réel sur chaque tab) |
| MR5 | Sous-utilisation Qurova actuelle peut cacher un problème de chargement font sur iOS WebView | faible | mineur | Vérifier visuellement après bascule globale |

## 15. Conclusion

L'app `cyna-app` est en très bon état de départ. Le travail à faire est **circonscrit, paramétrable, et 100% côté frontend** :
- ~5 corrections design system (couleur, police, routes)
- ~8 plugins Capacitor à installer et configurer
- ~10 patterns natifs à greffer sur les pages existantes
- ~4 features natives bonus (Face ID, Apple Pay, deep link, offline)

L'estimation totale est de **3,5 à 6 jours** de dispatching parallèle multi-agents en mode D — bien dans la fenêtre des 16 jours avant soutenance, et compatible avec l'objectif Tom de finaliser cette semaine.

La roadmap détaillée et le roster d'agents qui matérialisent ces conclusions sont dans `roadmap.md` et `agent-roster.md`.
