# B5 — Page-Adapter #2 — Notes

**Branche** : `feat/mobile-b5-pages-lot2`
**Date** : 2026-05-04

## Pages adaptées

| Page | Pull-to-refresh | Skeleton | Haptic |
|---|---|---|---|
| Cart | ✅ list-item | ✅ list-item (loading) | ✅ medium (remove, clear, checkout) |
| Checkout | ❌ (formulaire) | n/a | ✅ medium (Continue, Pay, Back) |
| Subscribe | ❌ (formulaire) | n/a | ✅ medium (Subscribe), light (toggle period, back) |
| Order confirmation | ❌ (page récap) | ✅ detail (loading) | ✅ selection (à l'arrivée), light (CTAs) |
| Contact | ❌ (formulaire) | n/a | ✅ medium (onSubmit valid form) |
| Legal (cgu, mentions, privacy) | ❌ | n/a | ❌ — safe-area bottom uniquement |
| Dashboard home | ✅ list-item | ✅ list-item (recent orders + subs) | ✅ light (4 quick action cards) |
| Dashboard account | ❌ (formulaire) | n/a | ✅ light (segmented tabs) |
| Dashboard orders | ✅ list-item | ✅ list-item (loading) | ✅ light (open order detail) |
| Dashboard subscriptions | ✅ list-item | ✅ list-item (loading) | ✅ medium (cancel/confirm), light (keep) |

## Décisions notables

### Pull-to-refresh sur orders/subscriptions enfants du dashboard

Les pages `orders` et `subscriptions` sont rendues à l'intérieur du
`<router-outlet>` du parent `dashboard.page.html` (lui-même dans un
`<ion-content>`). Le composant `<app-pull-to-refresh>` utilise
`<ion-refresher slot="fixed">` qui se rattache automatiquement à
l'`<ion-content>` ancestor — donc placé à l'intérieur de la template
enfant, il fonctionne correctement.

Chaque module enfant (`DashboardOrdersModule`, `DashboardSubscriptionsModule`,
chargés en lazy) doit importer indépendamment `SkeletonListComponent`,
`PullToRefreshComponent` et `HapticOnDirective`. C'est ce qui a été
fait — l'import dans `dashboard.module.ts` n'aurait pas suffi.

### Sur le dashboard home, le pull-to-refresh est conditionnel

`<app-pull-to-refresh>` n'est rendu que sur la home (`!hasChildRoute()`).
Chaque sous-page (orders, subscriptions) gère son propre refresher dans
son template. Ça évite de doublonner avec celui des enfants quand on
navigue.

### Skeletons inline vs `app-skeleton-list`

Les pages `dashboard/orders/orders.page.html`, `dashboard/subscriptions/`
et la home `dashboard.page.html` avaient des skeletons inline complexes
(animate-pulse divs). Tous remplacés par `app-skeleton-list variant="list-item"`.
Le rendu est légèrement plus simple visuellement (silhouette générique
au lieu de la silhouette exacte de la card), mais cohérent avec la
brique B3 et plus maintenable. Si besoin un visuel plus fidèle, créer
un nouveau variant dans `SkeletonListComponent` (hors scope B5).

### Haptic "selection" à l'arrivée sur order-confirmation

Implémenté via `HapticService` injecté dans la page (pas via
directive — pas de DOM-event ici, c'est un side-effect du `ngOnInit`
quand `order` est résolu). Fire-and-forget, fail-silent grâce au
guard `isNativeCapacitor()` à l'intérieur du service.

### Safe-area bottom

Appliqué via `style="padding-bottom: env(safe-area-inset-bottom)"` ou
`max(...)` Tailwind-compatible :
- `cart.page.html` — barre CTA fixe bas
- `checkout.page.html` — container avec CTA validation final
- `subscribe.page.html` — container avec CTA confirm
- `legal/*.page.html` — `<article>` long de contenu

Aucune modification du `global.scss` ni de Tailwind config — pure
inline style sur les conteneurs concernés.

## Hors scope identifiés (NON corrigés)

### Bouton "Sauvegarder" dans dashboard account tabs

Les tabs `account-tab`, `security-tab`, `billing-tab`, `preferences-tab`
sous `dashboard/account/components/` consomment un composant partagé
`<app-section-card>` qui contient le bouton de sauvegarde via une
output `(save)`. Le bouton lui-même vit dans le composant partagé
(hors `pages/`). Pour ajouter `appHapticOn="medium"` sur "Sauvegarder",
il faut modifier `shared/components/section-card/` — hors scope B5
(c'est un composant partagé). L'output `(save)` est triggered depuis
le shared, donc on ne peut pas non plus brancher le haptic via
`HapticService` côté tab sans modification du shared.

À traiter dans un futur batch ou via la directive `appHapticOn`
ajoutée directement sur le bouton à l'intérieur du `section-card`.

### Sélection adresse dans `<app-address-picker>` (checkout)

Le brief demande un `appHapticOn="light"` sur les radio cards de
sélection d'adresse. L'address-picker est un composant partagé
(`shared/components/address-picker/`) — hors scope B5. Documenté
ici pour B6+ ou Native-UX round 2.

### `@capacitor/browser` pour liens externes legal

Les pages legal ne contiennent actuellement pas de liens externes
explicites — elles affichent du texte traduit. Idée notée mais non
implémentée car pas de cas concret aujourd'hui dans les fichiers
i18n. À reconsidérer si on ajoute des liens vers documentation
externe.

## Tests

- 294 SUCCESS / 0 FAILED (264 préexistants + 30 ajoutés)
- Nouvelles specs créées :
  - `cart.page.spec.ts` (12 tests)
  - `order-confirmation.page.spec.ts` (3 tests)
  - `contact.page.spec.ts` (4 tests)
  - `dashboard.page.spec.ts` (3 tests)
  - `dashboard/orders/orders.page.spec.ts` (5 tests)
  - `dashboard/subscriptions/subscriptions.page.spec.ts` (5 tests)
- Couverture sur fichiers touchés ≥80% (refresh callbacks, loading
  states, haptic invocation, store delegation)
- Tests existants `checkout.page.spec.ts`, `subscribe.page.spec.ts` :
  inchangés, restent verts.

## E2E visual

Spec étendue `e2e/visual/specs/initial-snapshot.spec.ts` :
- Avant : 7 pages publiques
- Après : 12 pages (ajout cart, checkout, legal/cgu, legal/mentions,
  legal/privacy)
- 12/12 SUCCESS sur projet iphone-15 en 13,5s
- Helper `screenshot.ts` : non touché ✓
- Screenshots avant/après archivés dans
  `docs/audits/screenshots/b5/{before,after}/`

## Validation pré-PR

| Check | Statut |
|---|---|
| `npm run lint` | ✅ All files pass linting |
| `npm run build` | ✅ build successful (warnings préexistants uniquement) |
| `npm run test -- --watch=false --browsers=ChromeHeadless` | ✅ 294 SUCCESS |
| `npm run e2e:visual -- --project=iphone-15` | ✅ 12/12 passed |
