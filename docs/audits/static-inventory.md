# Inventaire statique — `cyna-app`

> Document de travail intermédiaire. Sera fold dans `mobile-native-audit.md` (L1) puis supprimé.

## 1. Pages et routes

### Routing principal
- Fichier : `src/app/app-routing.module.ts`
- **Lazy-loading systématique** sur toutes les pages (✅ bonne pratique)
- **Route par défaut** : `/splash` (mobile natif) ou `/landing` (web)
- **Guards de plateforme** : `browserOnlyGuard`, `nativeOnlyGuard` — pattern propre pour différencier les routes web vs natives

### Pages inventoriées

| Page | Route(s) | Guard | Patterns Ionic natifs |
|---|---|---|---|
| Splash | `/splash` | aucun | `ion-content fullscreen` (Angular custom, **pas** Capacitor splash natif) |
| Landing | `/landing` | `browserOnlyGuard` | rien de natif |
| Auth login/register | `/auth/login`, `/auth/register` | `guestGuard` | rien de natif |
| Home | `/home` | `nativeOnlyGuard` | navbar bottom (pattern natif présent) |
| Products / Services / Licenses | `/products`, `/services`, `/licenses` | `browserOnlyGuard` | `app-catalog-page` partagé |
| Product Detail | `/products/:slug`, `/services/:slug`, `/licenses/:slug` | aucun | `ion-back-button` ✅ |
| Cart | `/cart` | aucun | aucun pattern natif |
| Checkout | `/checkout` | aucun | Stripe Payment Element |
| Subscribe | `/subscribe/:slug` | `authGuard` | Stripe Payment Element |
| Order Confirmation | `/order/confirmation/:id` | aucun | aucun |
| Contact | `/contact` | aucun | formulaire réactif |
| Legal | `/legal/*` | `browserOnlyGuard` | pages statiques |
| Dashboard + enfants | `/dashboard/{home, account, orders, subscriptions, products, services, licenses, cart, checkout}` | `authGuard` | sidebar desktop, layout particulier |

### Patterns Ionic natifs absents (gap majeur)

L'audit n'a trouvé **aucune** occurrence des patterns mobile-native suivants dans les pages :

- `ion-refresher` (pull-to-refresh) — **absent**
- `ion-skeleton-text` (loading skeletons) — **absent**
- `ion-infinite-scroll` (chargement progressif) — **absent**
- `ion-fab` (floating action button) — **absent**
- `ion-item-sliding` (swipe to action) — **absent**
- `ion-list` natif — **absent** (utilise des `<div>` Tailwind à la place)

Seul `ion-back-button` est utilisé sur la page produit — signal positif mais isolé.

## 2. Core layer (`src/app/core`)

### `api/`
- `schema.ts` : 5183 lignes auto-générées depuis OpenAPI (`npm run openapi:generate`)
- ~101 opérations couvrant : Health, Auth, User, Catalog, Cart, Orders, Subscriptions, Payments, Admin
- ✅ couverture API très complète, peu/pas de gaps fonctionnels côté schéma

### `services/` (23 fichiers)
- API services : `api.service`, `cart-api`, `checkout-api`, `order-api`, `subscription-api`, `license-api`, `user-address-api`, `product`, `search`, `invoice`, `privacy`
- Fonctionnels : `stripe.service`, `payment-method.service`, `preferences.service`
- `preferences.service.ts` : **wrapper Capacitor Preferences avec fallback localStorage** — déjà mobile-aware ✅

### `stores/` (11 fichiers)
- Pattern hybride RxJS `BehaviorSubject` + Signals
- `base.store.ts` (classe abstraite) → `auth`, `cart`, `product`, `checkout`, `order`, `subscription`, `user-address`, `payment-method`, `invoice`, `catalog`
- AuthStore : refresh token automatique sur 401, session restore, stockage via PreferencesService

### `interceptors/`
- `auth.interceptor.ts` : Bearer token + refresh 401 + `X-Session-Id` + `Accept-Language` + `x-lang`

### `guards/`
- `auth.guard.ts` (avec `tryRestoreSession`)
- `guest.guard.ts` (redirige les loggués)
- `platform-redirect.guard.ts` (`browserOnlyGuard`, `nativeOnlyGuard`)

### `utils/`, `interfaces/`, `mocks/`
- `platform.utils.ts` : `isNativeCapacitor()` — détection Capacitor v6 ✅
- `address.utils.ts`
- `mocks/products.mock.ts` (données de test)

## 3. Shared components (`src/app/shared/components`, 29 dossiers)

`address-card`, `address-form`, `address-picker`, `browser-header`, `button`, `catalog-page`, `category-cards`, `checkbox`, `cyna-logo`, `dashboard-sidebar`, `dashboard-topbar`, `faq`, `footer`, `hero`, `input`, `mobile-header`, **`navbar`** (bottom tabs), `order-summary`, `pagination`, `product-card`, `product-card-skeleton`, `product-list`, `resend-email`, `search-modal`, `section-header`, `stripe-payment-element`, `topbar-actions`, `trusted-by`

Composant `product-card-skeleton` existe — **utilisé ?** À vérifier (probablement dans catalog-page).

## 4. Bottom tab bar (`navbar` component)

Fichier : `src/app/shared/components/navbar/navbar.component.ts`

**4 onglets** (cohérent avec maquettes cadrage) :

| Label | Route | Icône (phosphor) |
|---|---|---|
| Accueil | `/home` | `house` (regular/fill) |
| Catalogue | **`/catalog`** ⚠️ | `squares-four` |
| Panier | `/cart` | `shopping-cart` (avec badge count) |
| Compte | **`/account`** ⚠️ | `user` |

**⚠️ BUG identifié** : les routes `/catalog` et `/account` **n'existent pas** dans `app-routing.module.ts`. Les routes réelles sont `/products` (ou `/services`, `/licenses`) et `/dashboard/account`. La navbar lien vers du vide.

Conditionnement : `@if (isNative)` dans `home.page.html` — la navbar n'apparaît qu'en natif Capacitor. ✅

## 5. App bootstrap

### `app.component.ts`
- Injecte `CartStore`, `AuthStore`, `Router`
- Signal `isAuthenticated$`
- Signal `isDashboardRoute` (détecte `/dashboard*`)
- `ngOnInit()` → `cartStore.loadCart()`

### `app.component.html`
```html
<ion-app [class.dashboard-layout]="isDashboardRoute()">
  @if (isAuthenticated() && isDashboardRoute()) {
    <app-dashboard-sidebar />
  }
  <ion-router-outlet></ion-router-outlet>
  <app-search-modal />
</ion-app>
```

- Pas de header / navbar global au niveau app — chaque page gère ses headers
- Search modal global ✅
- Dashboard sidebar conditionnel desktop

## 6. Splash

- Implémentation : Angular custom, **pas** Capacitor native splash
- Logique `splash.page.ts` : logo affiché 1.5s, fade out 500ms, `navController.navigateRoot('/home')`
- **Gap** : il faudra basculer vers `@capacitor/splash-screen` pour un vrai splash natif iOS (display avant que la WebView soit prête)

## 7. Auth flow

### Stockage des tokens
- Via `PreferencesService` (`@capacitor/preferences` avec fallback localStorage)
- ⚠️ Ce n'est **pas** un cookie HTTP-only — divergence avec la consigne CLAUDE.md ("JAMAIS de localStorage, cookies HTTP-only uniquement"). À discuter : sur mobile WebView, les cookies HTTP-only fonctionnent mais ont des limitations (pas accessibles à JS, problèmes de domain). PreferencesService est plus pragmatique pour mobile.
- En natif iOS, Capacitor Preferences utilise NSUserDefaults — **pas le Keychain**. Pour la sécurité bancaire, il faudrait éventuellement migrer vers `@capacitor-community/secure-storage` ou Keychain natif. À évaluer dans l'audit final.

### Refresh token
- Endpoint : `POST /auth/refresh-token`
- Géré par `AuthStore.tryRestoreSession()` + `auth.interceptor.ts`
- Si 401 → refresh, sinon redirect `/auth/login` avec `returnUrl`

## 8. API integration

- 101 opérations couvrant tous les domaines fonctionnels du cadrage
- Auth dispose de `register/login/verify-email/forgot/reset/refresh-token/logout` + admin avec 2FA
- Payments : `create-intent`, `confirm`, `methods`
- Subscriptions : `cancel`, `pause`, `resume`
- Couverture jugée suffisante pour le scope mobile actuel

## 9. Tailwind / styles

- Tailwind **v4** avec `@theme inline` (pour contourner le Shadow DOM Ionic)
- Fichier root : `tailwind.css`
- **Aucun .scss global** sauf `home.page.scss` et `app.component.scss` (à inspecter pour vérifier qu'il n'y a pas de CSS custom interdit par CLAUDE.md)
- Aucune utilisation `@apply` custom
- Icônes via `@ng-icons/phosphor-icons` (regular + fill)

### Couleurs actuelles vs cadrage — **divergence majeure**

| Rôle | Code actuel | Code cadrage | Action |
|---|---|---|---|
| Primary | `#4f39f6` (violet) | **`#1447E6`** (indigo) | **À CORRIGER** |
| Text | `#0a0a0a` | `#0A0A0A` | OK |
| Background | `#f9f9f9` | `#F9F9F9` | OK |
| Surface | `#ffffff` | (non spécifié) | OK |
| Borders | `#e5e5e5`, `#f0f0f0` | (non spécifié) | OK |

**⚠️ La couleur primaire actuelle ne correspond pas au cadrage**. Un agent dédié devra basculer toutes les occurrences `#4f39f6` → `#1447E6`. Idem pour le badge navbar.

### Polices
- Inter chargée (✅ correspond cadrage)
- **Qurova non détectée** — la police titre du cadrage. À vérifier et ajouter (gap branding).

## 10. Synthèse — Constats forts

### ✅ Acquis (pas à refaire)
- Architecture Standalone + lazy routes propre
- State management cohérent (stores RxJS + signals)
- Capacitor v6 détecté correctement, guards platform
- Auth interceptor + refresh token déjà mobile-aware (PreferencesService)
- Bottom tab bar 4 onglets aligné cadrage (mais routes cassées)
- Schema OpenAPI à jour, 101 endpoints couvrent le scope
- Tailwind v4 propre, pas de SCSS interdit visible
- `ion-back-button` utilisé sur le détail produit (bon départ)

### ❌ Gaps (à combler dans les sous-projets 2-5)

**P0 — Bloquants démo soutenance :**
1. **Routes navbar cassées** : `/catalog` et `/account` inexistantes — la navbar lien vers du vide
2. **Couleur primaire incorrecte** : `#4f39f6` actuel vs `#1447E6` cadrage
3. **Police Qurova absente** : titres en Inter au lieu de Qurova
4. **Splash Capacitor natif absent** : splash Angular custom, pas de splash iOS natif

**P1 — Qualité native attendue :**
5. **Pull-to-refresh absent partout** (listes produits, commandes, abonnements)
6. **Skeletons absents** (skeleton existe pour product-card mais usage à vérifier)
7. **Aucun haptic feedback**
8. **Aucune transition de page native** (slide latéral)
9. **Pas de safe area iOS** (notch / home indicator) explicite — à vérifier sur build
10. **Status bar non stylée** (couleur, light/dark)

**P2 — Fonctionnalités natives ajoutées par Tom :**
11. Face ID / Touch ID au login : non implémenté
12. Apple Pay via Stripe : à activer
13. Deep linking / Universal Links : non configuré
14. `navigator.share` : non utilisé
15. Mode hors-ligne minimal : non implémenté
16. Stockage tokens en Keychain (vs NSUserDefaults Capacitor Preferences) : à évaluer

**P3 — Cohérence cadrage :**
17. App icon Cyna sur iOS : à vérifier (probablement icône par défaut Ionic)
18. Stockage tokens : décision à acter (Preferences vs Cookie HTTP-only — diverge de CLAUDE.md mais pragmatique mobile)
