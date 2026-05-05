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

`NavbarComponent` (in `shared/components/navbar/`) renders an Ionic
native `<ion-tab-bar slot="bottom">` with 4 tab buttons:

| Tab       | Route      | Notes                                                              |
| --------- | ---------- | ------------------------------------------------------------------ |
| Accueil   | `/home`    | Native-only (`nativeOnlyGuard`)                                    |
| Catalogue | `/catalog` | Native-only — currently has a navigation bug, see Known issues     |
| Panier    | `/cart`    | Shared route, badge shows cart count when `> 0`                    |
| Compte    | `/account` | Route not yet implemented; tap currently falls through to wildcard |

The component uses `<ion-tab-button [routerLink]="...">` (manual routing,
no `<ion-tabs>` parent). This was a deliberate choice to avoid
restructuring the routing under children routes — the tab bar is
duplicated per page (via `<app-navbar />` in each page's `<ion-footer>`)
because routes in this project are flat, not hierarchical.

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

## Known issues (to fix in dedicated debug session)

### 🔴 Issue 1 — `/catalog` tab navigation fails

- **Symptom**: Tap on Catalogue tab in navbar stays on `/home` (the
  navigation completes towards `/home`, indicating the wildcard `**`
  intercepted `/catalog`).
- **Investigation done**: Tested with/without `nativeOnlyGuard`, lazy
  vs non-lazy, `loadComponent` vs `loadChildren` (with a
  `catalog.routes.ts` wrapper), minimal test component ("CATALOG TEST
  PAGE" red banner). All reproduce. Routing is properly registered
  (browser test confirms guard redirect to `/landing`; compiled iOS
  bundle has `path: "catalog"` before the wildcard).
- **Hypothesis**: Likely an issue with router event interception or
  WKWebView-specific routing edge case. Not reproducible on web. The
  `simctl log stream` pipeline does not surface WKWebView
  `console.log` output, so plain log injection failed.
- **Next session**: Open Safari Web Inspector on simulator localhost,
  tap Catalogue, capture console + Router events to identify root
  cause.

### 🔴 Issue 2 — Double header when navigating to non-home pages

- **Symptom**: When navigating from `/home` to a page that uses
  `variant="back"` header (tested with `/cart`), the previous page's
  header (variant="home" with logo + search) leaks through behind the
  new page header. `mobile_list_elements_on_screen` confirms a
  `Search` button at y=83 (home's mobile-header) plus the cart's
  variant=back back-arrow at y=150 — both rendered simultaneously.
- **Cause confirmed**: `IonicRouteStrategy` keeps previous pages
  mounted in `<ion-router-outlet>` for native iOS transition caching.
  The previous page's `<ion-header>` renders behind the current
  page's `<ion-header>` because the current page is not properly
  wrapped in an `<ion-page>` with opaque background.
- **Fixes attempted (failed)**:
  - `[style.--background]="'#ffffff'"` on `<ion-toolbar>` of cart
  - removing `[style.--min-height]="0"` (let toolbar size to its
    content)
  - adding `[fullscreen]="true"` on cart's `<ion-content>`
- **Hypotheses for next session**:
  1. Need explicit `<ion-page>` wrapper around the page content
     (override the router-outlet auto-wrap)
  2. `RouteReuseStrategy` needs to be `DefaultRouteReuseStrategy`
     instead of `IonicRouteStrategy` (cost: lose page caching, less
     smooth transitions)
  3. CSS issue: opaque background must be on the wrapping element,
     not just the toolbar
- **Next session**: Inspect DOM stacking via Safari Web Inspector,
  identify exact wrapper structure, apply correct fix.

### 🟡 Issue 3 — Stale `/tabs/catalogue` links in `home.page.html`

- **Symptom**: `home.page.html` lines 27 and 37 have
  `routerLink="/tabs/catalogue"` (legacy path that no longer exists).
- **Gated on**: Issue 1 fix — once `/catalog` navigation works, fix
  these links to point to `/catalog`.
