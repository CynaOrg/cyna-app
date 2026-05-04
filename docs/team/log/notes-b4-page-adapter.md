# B4 — Pages adaptation lot 1 — Notes (Page-Adapter #1)

**Branche** : `feat/mobile-b4-pages-lot1`
**Date** : 2026-05-04

## Pages adaptees

| Page | Pattern applique |
|------|-------------------|
| `pages/auth/login` | `appHapticOn="medium"` sur `<app-button>` Submit |
| `pages/auth/register` | `appHapticOn="medium"` sur Submit |
| `pages/auth/forgot-password` | `appHapticOn="medium"` sur Submit |
| `home/` (HomePage) | `<app-pull-to-refresh>` + `onRefresh()` -> `productStore.fetchProducts({ limit: 20 })` + `complete()` |
| `pages/products` | `<app-pull-to-refresh>` + remount du `<app-catalog-page>` via `@if (showCatalog)` |
| `pages/services` | idem products |
| `pages/licenses` | idem products |
| `pages/product-detail` | `appHapticOn="medium"` sur les deux CTA "Ajouter au panier / S'abonner" (mobile + desktop) ; `appHapticOn="light"` sur les `app-product-card` similaires |
| `pages/splash` | conserve son role d'ecran de transition Angular (voir notes ci-dessous) |

## Decisions notables

### `appHapticOn` sur `<app-button>` (et pas sur le `<button>` interne)

Le composant `app-button` est standalone et son host element a la classe
`block w-full`. La directive `[appHapticOn]` s'attache au host. Le clic
du `<button>` interne bouillonne jusqu'au host, donc le haptic se declenche
correctement. Avantage : pas besoin de modifier `app-button` (hors scope
shared/components).

### Pull-to-refresh sur products / services / licenses : remount du catalog

`app-catalog-page` (shared) provide son propre `CatalogStore` en interne
et fait son fetch dans `ngOnInit`. Comme on ne peut pas modifier ce
composant (hors scope) et qu'on ne peut pas atteindre son store depuis
le parent, j'ai opte pour un re-mount via `@if (showCatalog)`.

Sequence:
1. L'utilisateur tire vers le bas -> `(refresh)` emis par `<app-pull-to-refresh>`
2. `showCatalog = false` (catalog detruit, son store aussi)
3. Microtask -> `showCatalog = true` (catalog remonte, refait son fetch)
4. `setTimeout 400ms` -> `refresher.complete()` ferme le spinner

Tradeoff : un blink visuel court pendant le remount. C'est acceptable
car le catalog a son propre skeleton interne (`app-product-card-skeleton`)
qui apparait pendant ce temps. Alternative propre : ouvrir une API
publique sur `app-catalog-page` (`reload(): void`), mais c'est typiquement
un changement B5 ou shared scope.

### Home : pas de skeleton-list au niveau de la page

`HomePage` delegue completement le rendu a `<app-product-list>` qui a deja
son propre indicateur de chargement (spinner). Empiler un
`<app-skeleton-list>` au-dessus serait redondant et casserait le layout
mobile/browser deja teste. La pull-to-refresh + le spinner existant
suffisent au feel natif.

### Splash : conserve

La splash native Capacitor (B1) est cachee par `app.component` (hors
scope). La page Angular `/splash` reste utile comme ecran de
transition avec fade vers `/home`. Aucune redondance fonctionnelle
critique : l'utilisateur voit la splash native (1.5s typiquement),
puis brievement la page Angular (1.5s + fade 500ms = 2s) pendant que
le bundle Angular s'hydrate.

Si l'equipe veut supprimer le doublon, il faut :
- soit appeler `SplashScreen.hide()` plus tard (apres le 1.5s + fade)
- soit court-circuiter `/splash` en native et naviguer directement vers `/home`

A trancher au niveau B7 (App-Polish) ou en revue. **Pas modifie ici.**

## Hors scope observes (non corriges)

- `app-catalog-page` (shared) ne propose pas d'API publique de reload.
  Documenter pour B5 ou un futur cleanup shared.
- `app-product-list` (shared) a son propre spinner. Idealement, basculer
  ce composant vers `<app-skeleton-list>` pour homogeneite. Hors scope
  (shared/components).
- `pages/splash` redondance avec splash natif Capacitor (note ci-dessus).

## Tests

Run karma : **276 / 276 SUCCESS** (etait 264 apres B3, +12 nouveaux)

Nouveaux tests ajoutes :
- `home/home.page.spec.ts` : 4 tests (init fetch, onRefresh happy path, onRefresh err path, create)
- `pages/products/products.page.spec.ts` : 3 tests (create, default state, onRefresh)
- `pages/services/services.page.spec.ts` : 3 tests (idem)
- `pages/licenses/licenses.page.spec.ts` : 3 tests (idem)

Tous les tests existants restent verts.

## Validation pre-PR

- `npm run lint` : OK (0 erreurs, 0 warnings)
- `npm run build` : OK (warnings NG8107 / NG8113 pre-existants seulement)
- `npm run test` : 276 / 276 SUCCESS
- `npm run e2e:visual -- --project=iphone-15` : 7 / 7 passed

## Visual diff

- Avant : `docs/audits/screenshots/b4/before/`
- Apres : `docs/audits/screenshots/b4/after/`

Les screenshots avant/apres sont quasi identiques (diff binaire =
identique sur products-list par exemple). C'est attendu : nous n'avons
ajoute que des composants invisibles (`<ion-refresher slot="fixed">` ne
s'affiche que pendant la geste pull-down) et des directives sans effet
visuel (`HapticOnDirective`).

## Fichiers modifies

### Pages (templates + ts + modules)
- `src/app/home/home.page.ts`
- `src/app/home/home.page.html`
- `src/app/home/home.module.ts`
- `src/app/home/home.page.spec.ts` (test renforce)
- `src/app/pages/auth/login/login.page.html`
- `src/app/pages/auth/login/login.module.ts`
- `src/app/pages/auth/register/register.page.html`
- `src/app/pages/auth/register/register.module.ts`
- `src/app/pages/auth/forgot-password/forgot-password.page.html`
- `src/app/pages/auth/forgot-password/forgot-password.module.ts`
- `src/app/pages/products/products.page.ts`
- `src/app/pages/products/products.module.ts`
- `src/app/pages/products/products.page.spec.ts` (NEW)
- `src/app/pages/services/services.page.ts`
- `src/app/pages/services/services.module.ts`
- `src/app/pages/services/services.page.spec.ts` (NEW)
- `src/app/pages/licenses/licenses.page.ts`
- `src/app/pages/licenses/licenses.module.ts`
- `src/app/pages/licenses/licenses.page.spec.ts` (NEW)
- `src/app/pages/product-detail/product-detail.page.html`
- `src/app/pages/product-detail/product-detail.module.ts`

### Docs
- `docs/audits/screenshots/b4/before/*.png` (7 fichiers)
- `docs/audits/screenshots/b4/after/*.png` (7 fichiers)
- `docs/team/log/notes-b4-page-adapter.md` (ce fichier)
