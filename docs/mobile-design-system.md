# Mobile design system — cyna-app

This document is the source of truth for the **native mobile build**
(Ionic 8 + Capacitor 8 on iOS/Android) of the cyna-app. It captures the
shell pattern, header variants, navigation conventions, and known
issues so any contributor can ship a new mobile screen consistently.

It does NOT cover the web/browser build — see workspace `CLAUDE.md`
for the web/mobile split rules and the `mobile-ui` subagent prompt.

## Page shell pattern

Every native mobile page must follow this skeleton:

```html
<!-- @if (!isDashboard) { -->
<ion-header class="ion-no-border">
  <ion-toolbar [style.--padding-top]="0" [style.--padding-bottom]="0" [style.--padding-start]="0" [style.--padding-end]="0" [style.--min-height]="0">
    <app-mobile-header [variant]="..." [title]="..." />
  </ion-toolbar>
</ion-header>
<!-- } -->

<ion-content [fullscreen]="true">
  <!-- page content -->
</ion-content>

<!-- @if (isNative) { -->
<ion-footer class="ion-no-border">
  <app-navbar />
</ion-footer>
<!-- } -->
```

Why:

- `<ion-header>` + `<ion-content>` + `<ion-footer>` is the standard
  Ionic 8 layout, which gives correct top safe-area, scrollable content
  area, and bottom safe-area handling out of the box.
- `<ion-toolbar>` with all paddings and min-height set to 0 lets our
  custom `<app-mobile-header>` control its own dimensions (h-[80px]).
- `<app-navbar>` lives in `<ion-footer>`, NOT inside `<ion-content>`.
  This is what allows the native bottom safe-area (iPhone home
  indicator) to be respected automatically.
- For shared pages used by both web and native, wrap the native shell
  inside `@if (isNative) { … }` and the web header in the `@else`
  branch. Never alter web rendering when fixing a native issue.

## `<app-mobile-header>` variants

`MobileHeaderComponent` (in `shared/components/mobile-header/`) exposes
two signal inputs:

- `variant: 'home' | 'title' | 'back'` (default `'home'`)
- `title: string` (i18n key, used by `'title'` and `'back'` variants)

| Variant          | Layout                                                                    | Use case                                                         |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `home` (default) | Logo Cyna left + search & cart buttons right                              | App entry pages (`/home`, future top-level screens)              |
| `title`          | Title centered + search & cart buttons right                              | Browsing pages (`/catalog` once fixed)                           |
| `back`           | Back-arrow left (calls `Location.back()`) + title centered + spacer right | Detail/sub pages (`/cart`, `/checkout`, `/product-detail`, etc.) |

Usage:

```html
<app-mobile-header variant="back" title="CART.TITLE" />
```

The `title` input must be an i18n key declared in `assets/i18n/{fr,en}.json`.
The component pipes it through `| translate`.

## `<app-navbar>` — bottom tab bar

`NavbarComponent` (in `shared/components/navbar/`) renders a custom
Tailwind `<nav>` with 4 `<a routerLink>` tab buttons:

| Tab       | Route      | Notes                                                              |
| --------- | ---------- | ------------------------------------------------------------------ |
| Accueil   | `/home`    | Native-only (`nativeOnlyGuard`)                                    |
| Catalogue | `/catalog` | Native-only — currently has a navigation bug, see Known issues     |
| Panier    | `/cart`    | Shared route, badge shows cart count when `> 0`                    |
| Compte    | `/account` | Route not yet implemented; tap currently falls through to wildcard |

See _Architecture decisions_ below for why we use a custom navbar
rather than `<ion-tab-bar>`. The component is duplicated per page
(via `<app-navbar />` in each page's `<ion-footer>`) because routes
in this project are flat, not hierarchical.

## Architecture decisions

### Bottom navbar : custom Tailwind (NOT `<ion-tab-bar>` standalone)

We use a custom Tailwind `<nav>` with `<a routerLink>` for the bottom
navbar instead of `<ion-tab-bar>`.

**Reason**: `<ion-tab-bar>` requires a wrapper `<ion-tabs>` with
children routes to function. Using `<ion-tab-bar>` standalone (without
`<ion-tabs>`) results in tab buttons that don't navigate at all (Ionic
intercepts clicks but has no routing mechanism to dispatch). This was
attempted in commit `fd62753` and confirmed broken via Safari Web
Inspector — the title stayed `localhost — home` regardless of which
tab was tapped.

Migrating to `<ion-tabs>` would require restructuring all routes as
children of an `<ion-tabs>` component, which would either:

- Affect web routing (web does not use `ion-tabs`)
- Require duplicate routing trees for native vs web

Until we find an acceptable solution, we keep the custom navbar. The
trade-off is that we lose native iOS tap feedback (ripple, haptics)
and bottom safe-area auto-handling. These are tracked as separate
improvements.

## Build & API configuration

### Environments

- `environment.ts` → web dev (`apiUrl: '/api/v1'`, served via
  `proxy.conf.json` → backend on `localhost:3000`)
- `environment.prod.ts` → web prod (`apiUrl: 'https://api.cyna.it/api/v1'`)
- `environment.native.ts` → mobile native dev (`apiUrl: 'http://localhost:3000/api/v1'`,
  absolute URL because the iOS simulator bundle has no proxy and would
  otherwise resolve to `capacitor://localhost/api/v1/...` which is a
  dead scheme)

### Build commands

| Target                             | Command                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Web dev (with proxy)               | `ng serve`                                                                                                                                   |
| Web prod                           | `ng build` (uses `production` configuration)                                                                                                 |
| **Mobile dev (iOS simulator)**     | **`npm run build:native`** (= `ng build --configuration native-development && cap sync ios`)                                                 |
| Mobile prod (TestFlight/App Store) | TODO — create `environment.native.prod.ts` pointing to `https://api.cyna.it/api/v1` and a matching `native-production` Angular configuration |

### Backend CORS

The API gateway at `cyna-api/apps/api-gateway/src/main.ts` reads
`CORS_ORIGINS` from the environment. For native mobile to consume the
API, the gateway whitelist must include `capacitor://localhost`
(iOS default scheme), `http://localhost` and `https://localhost`
(future Android default). This is configured in `cyna-api/.env` and
`cyna-api/.env.example`.

### Test accounts

- **Production** (`https://api.cyna.it`): `vizlyfr@gmail.com` / `Test1234!`
- **Local** (`http://localhost:3000`): `test@cyna.local` / `Test1234!`

The local account does not exist by default. After a fresh DB
(`docker compose down -v` then up), recreate it:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cyna.local","password":"Test1234!","firstName":"Test","lastName":"Mobile"}'

docker exec cyna-postgres psql -U cyna -d cyna_db \
  -c "UPDATE users SET is_verified = true WHERE email = 'test@cyna.local';"
```

The `UPDATE` step is required because the API gateway returns
`403 EMAIL_NOT_VERIFIED` until `is_verified = true`. The notification
service in dev does not actually deliver the verification email, so
flipping the flag manually is the supported workflow.

### Future-proofing TODO

- Create `environment.native.prod.ts` for TestFlight/App Store release
  builds.
- Consider runtime detection or an `environment.native.device.ts` for
  testing on a physical iOS device with the backend on the LAN
  (requires the LAN IP rather than `localhost`).

## Ionic animations

`IonicModule.forRoot({ animated: isNativeCapacitor() })` enables iOS
native slide-in/slide-out transitions on native builds. On the web
build, animations remain disabled to keep page swaps snappy and
predictable for desktop.

## Platform detection

Always use `isNativeCapacitor()` from `@core/utils/platform.utils`.
Never use `Capacitor.isNativePlatform()` — it returns `true` on Safari
macOS due to a Capacitor bug (issue #7241).

## Tailwind tokens (relevant for headers and tabs)

Defined in `cyna-app/tailwind.css` via `@theme inline`:

- `--color-surface: #ffffff` → `bg-surface` (header / tab bar background)
- `--color-text-primary: #0a0a0a` → `text-text-primary` (active tab,
  headlines)
- `--color-text-muted: #9ca3af` → `text-text-muted` (inactive tab labels)
- `--color-primary: #4f39f6` → `bg-primary` (active state, brand)
- `--color-primary-light: #ede9fe` → `bg-primary-light`

Do not add new tokens without aligning with the design source of truth.
Do not modify `tailwind.css` to fix a native issue — fix it inline on
the component instead.

## Adding a new mobile page (5-step recipe)

1. **Create the page file** under `src/app/pages/<feature>/<feature>.page.ts`,
   standalone, signals, new control flow.
2. **Apply the shell skeleton** (see _Page shell pattern_ above), with
   the appropriate header variant.
3. **Add the route** in `src/app/app-routing.module.ts`, with
   `canActivate: [nativeOnlyGuard]` if the page is native-only.
4. **(Optional) Wire a navbar tab** if the page should be reachable
   from the bottom tab bar (edit `NavbarComponent.navItems`).
5. **Sync and test**: `npx cap sync` from `cyna-app/`, relaunch the
   simulator, validate the four shell zones (top safe-area, header,
   content scrolling, bottom navbar over home indicator).

## Menu list pattern (iOS Settings-style)

Used in `/account` (`cyna-app/src/app/pages/account/account.page.ts`)
to render grouped lists of navigation links, mirroring Apple's
Settings app conventions. Apply this pattern any time a native
mobile screen needs to surface a list of navigable actions grouped
by category.

**Structure:**

- **Section header**: small uppercase label
  (`text-xs uppercase tracking-wider text-text-muted px-6 pt-6 pb-2`).
- **Card container** wrapping the section's items:
  `mx-4 my-2 rounded-xl bg-surface overflow-hidden`. The
  `overflow-hidden` is what clips the inner `border-b` on the last
  item if any; in our implementation we already drop the border on
  the last via `[class]="!last ? 'border-b border-black/5' : ''"`.
- **Item row**: a clickable `<a [routerLink]>` styled as
  `flex items-center px-4 py-3 gap-3`, with three children:
  - leading icon (`<ng-icon [name]="..." size="20">`,
    color `text-text-secondary`)
  - flexible label (`flex-1 text-text-primary`, fed via
    `{{ key | translate }}`)
  - trailing chevron (`<ng-icon name="phosphorCaretRight" size="16">`,
    color `text-text-muted`)
- **Item separator**: a thin bottom border on every row except the
  last of its card (`border-b border-black/5`). Applied conditionally
  via `[class]="!last ? '...' : ''"` inside `@for` with `let last = $last`.
- **Destructive action** (logout, delete, etc.): rendered as an
  isolated full-width `<button>` BELOW the last card with extra
  vertical spacing (`mt-8`), same card styling, but red label
  (`text-red-600`). Never grouped inside a regular card. Pattern:

  ```html
  <button type="button" (click)="logout()" class="mx-4 mt-8 mb-6 w-[calc(100%-2rem)] rounded-xl bg-surface p-4 text-center font-medium text-red-600" style="border: none;">{{ 'ACCOUNT.LOGOUT' | translate }}</button>
  ```

**Why this pattern:** matches user expectations from native iOS
Settings; visually clear hierarchy (data vs profile vs destructive);
each row is a tap target with a chevron affordance signalling
navigation. No external native iOS plugin required — pure Tailwind
on top of Ionic shell.

## Known issues (open)

### 🟠 Cart natif — "Erreur lors du chargement du panier" pré-login

**Symptom:** When opening `/cart` on native iOS without being logged in, the page shows "Erreur lors du chargement du panier" instead of the expected empty cart state.

**Suspected cause:** Cart store probably tries to fetch cart from API on init, fails with 401 since unauthenticated, no graceful fallback to empty state.

**Note:** Web behavior to re-verify in Partie 5.

**Scope:** To fix in Partie 5 (Cart + Checkout system).

### 🟠 `/dashboard/orders` — "Failed to load orders" instead of empty state

**Symptom:** Opening `/dashboard/orders` on a freshly logged-in account
with no orders displays "Failed to load orders" rather than the
expected empty-state.

**Suspected cause:** Same shape as the cart pre-login bug — orders
API call probably fails (401/empty payload mishandled) and the
component does not fall back to the empty-state branch.

**Scope:** To fix in Partie 6 (Account / Dashboard system).

### 📝 Universal Link iOS for password reset — TODO post-MVP

Reset-password page is reachable in-app via direct URL navigation but
**not via email links on native iOS** (Universal Links not configured).

To enable email-link → app deep-linking:

1. Host `apple-app-site-association` JSON on `cyna.app/.well-known/`
   (infra task, requires DNS/hosting access).
2. Add Associated Domains entitlement to `ios/App/App/App.entitlements`.
3. Wire the Capacitor `App` plugin URL handler to route incoming
   Universal Links to `/auth/reset-password?token=...`.

**Scope:** Schedule for Partie 8 (Production / TestFlight prep).

### 📝 orders.customer_email — guest backfill data loss

24 rows had NULL `customer_email` when the migration enforced
NOT NULL constraint (Partie 5 setup, TypeORM synchronize bumped
`guest_email` → `customer_email`). Temporarily filled with
`unknown@cyna.local`, then properly backfilled from `users.email`
via JOIN where `user_id` was available:

- **11 rows recovered** to real email (registered users)
- **13 rows remain as `unknown@cyna.local`** — guest checkouts where
  no email was captured in `billing_address_snapshot` either. Data
  permanently lost.

**Backend TODO** : guest checkout flow should ALWAYS persist email
either in `customer_email` directly or in
`billing_address_snapshot.email` for receipts and audit. To verify
in `payment-service` / `order-service` create-order path. This is
local dev test data so no production impact, but the same flow
exists in prod and would lose guest receipt context if a similar
migration occurs.

### 📝 Empty / loading / error states polish — global

Polish cohérent sur **TOUS** les empty/loading/error states de l'app
(catalog, dashboard sub-pages, orders, addresses, subscriptions,
licences, cart) à traiter en Partie 7 (Polish pass) pour préserver
la cohérence visuelle inter-écrans.

### 📝 Apple Pay activation steps — TODO post-MVP

The Apple Pay integration is code-complete (frontend
`paymentRequestButton`, backend `automatic_payment_methods`, iOS
entitlement `merchant.io.cyna.app`), but **the Apple Pay button
will not appear** until the following infra steps are done:

1. Register merchant identifier `merchant.io.cyna.app` on Apple
   Developer Portal (Identifiers → Merchant IDs).
2. Wire the entitlements file into the Xcode project (build setting
   `CODE_SIGN_ENTITLEMENTS = App/App.entitlements`) — currently the
   file is committed but not referenced from `project.pbxproj` to
   avoid risky pbxproj edits without validation.
3. Enable Apple Pay in Stripe Dashboard with that merchant identifier
   (Stripe will guide through CSR/key generation flow).
4. Generate Apple Pay payment processing certificate via Stripe.
5. Test on **physical iOS device** with Wallet enrolled. Simulator
   never displays the Apple Pay button (`canMakePayment()` resolves
   to `null`, button stays hidden — this is expected).

**Scope:** Schedule for Partie 8 (Production / TestFlight prep).

## Resolved issues (during initial layout system phase)

### ✅ Issue 1 — `/catalog` tab navigation fails

**Resolved.** Root cause: WKWebView cache corruption from a
previous debugging session served a stale bundle that fell through
to the wildcard. Fix: clean uninstall + reinstall via
`xcrun simctl uninstall booted io.cyna.app && npx cap run ios`.

Lesson: when debugging mobile native runtime weirdness, prefer a
full uninstall + reinstall over `cap sync` only — sync copies the
web bundle but does not always clear the WKWebView cache. Use
Safari Web Inspector to see actual `console.log` and Router events;
`simctl log stream` does not surface WKWebView JS console output.

### ✅ Issue 1.b — Catalog API calls failed after navigation fix

**Resolved.** Root cause: `environment.ts` (dev) had
`apiUrl: '/api/v1'` (relative), which works on web via the ng serve
proxy but resolves to `capacitor://localhost/api/v1/...` (404) on
the iOS simulator. Two-part fix:

- **Backend (`cyna-api`)**: whitelist `capacitor://localhost`,
  `http://localhost`, `https://localhost` in `CORS_ORIGINS`
  (committed in `cyna-api/.env.example`).
- **Mobile (`cyna-app`)**: new `environment.native.ts` with absolute
  `apiUrl: 'http://localhost:3000/api/v1'`, loaded via the new
  `native-development` Angular configuration. Build with
  `npm run build:native`.

### ✅ Issue 2 — Double header on navigation

**Resolved as side-effect** of reverting the `<ion-tab-bar>`
refactor attempt (commit reverting `fd62753`). The earlier
"double header" symptom was observed only while the `<ion-tab-bar>`
standalone navbar was in place, which itself broke navigation. With
the original custom Tailwind navbar restored, the cart page renders
its single header again.

Reference notes (in case a similar leak resurfaces): the previous
page can stay mounted in `<ion-router-outlet>` for native iOS
transition caching (IonicRouteStrategy). The current page must be
wrapped in an `<ion-page>` with opaque background to fully cover
the previous one. Failed quick fixes that did not solve the leak
when reproduced: `--background` on `<ion-toolbar>`, removing
`--min-height: 0`, `[fullscreen]="true"` on `<ion-content>`. A real
fix would likely need an explicit `<ion-page>` wrapper or switching
back to `DefaultRouteReuseStrategy` (at the cost of native
transitions caching).

### ✅ Issue 3 — Stale `/tabs/catalogue` links in `home.page.html`

**Resolved.** Lines 27 and 37 of `home.page.html` updated to point
to `/catalog` (the new mobile route).

### ✅ Bug — Missing `phosphorWarningCircle` icon import

**Resolved.** Icon added to the `provideIcons()` registration of
`CartPageModule`. The icon was used in `cart.page.html` but only
imported in `order-confirmation.module.ts`.

### ✅ Issue 4 — `/account` tab redirected silently to `/home`

**Resolved.** Root cause: the navbar's `Compte` tab pointed to a
non-existent route, falling through to the wildcard `**` redirect
→ `/home`. Fix: created
`cyna-app/src/app/pages/account/account.page.ts` with
`nativeOnlyGuard` + `authGuard`, registered in
`app-routing.module.ts`. Items reuse existing `/dashboard/*` shared
routes (responsive shell already handles 375px viewport). The page
uses the new "Menu list pattern (iOS Settings-style)" documented
above. Logout is fire-and-forget via `AuthStore.logout()` which in
turn calls `clearSession()` and redirects to `/auth/login`.
