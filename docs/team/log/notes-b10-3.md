# B10.3 — Catalog hub mobile + Qurova font scope fix

## Décisions techniques

### 1. Routing — `browserOnlyGuard` retiré de `/products`, `/services`, `/licenses`

Avant B10.3, les routes catalog étaient gardées par `browserOnlyGuard`, ce
qui empêchait l'accès depuis l'app native. Conjugué au redirect
`/catalog → /products` (créé en B2 pour la navbar), le bouton "Catalogue"
de la bottom nav natif terminait sur une boucle de redirection vers
`/home`, donc en pratique : un écran qui ne fait rien.

Solution retenue : retirer `browserOnlyGuard` des trois routes catalog.

- Les pages `products`/`services`/`licenses` rendent déjà le bon header
  selon la plateforme (`<app-mobile-header>` en native via le routeur de
  catalog-page si appelé depuis le hub, ou `<app-browser-header>` côté
  web).
- Pas besoin de routes parallèles "natives" — un seul code path par
  catalogue suffit.
- `nativeOnlyGuard` est appliqué uniquement à `/catalog` (le hub) pour
  qu'en browser on tombe sur la landing.

### 2. Page `catalog-hub` (native uniquement)

Inspirée de la maquette cadrage page 38 :

- Header : `<app-mobile-header>` (logo Cyna + search + cart)
- Section "Découvrez nos solutions" (h2 marketing en font-display)
- Trois cards : Services / Produits / Licences (image hero + titre + CTA
  fléché)
- Section "Populaires" : `<app-product-list variant="mobile">` alimentée
  par `productStore.featured$`
- Footer : `<app-navbar>`

Module strict : seule la page nouvelle est créée (`pages/catalog-hub/`).
Aucun composant partagé ajouté.

### 3. Font Qurova — passage de global h1/h2 à utility `font-display`

`global.scss:67` appliquait `font-family: "Qurova"` sur **tous** les h1/h2
de l'application. Conséquence : les titres `ion-alert`, `ion-modal`,
`ion-action-sheet` rendent en interne un `<h2>` qui héritait de Qurova
(police display épaisse type marketing) → illisibles sur iOS.

Remède :

- Suppression de la règle globale `h1, h2 { font-family: "Qurova"... }`.
- Ajout du token `--font-display: "Qurova", ...` dans `tailwind.css`
  (`@theme inline`) → Tailwind v4 expose la classe utilitaire
  `font-display` automatiquement.
- Application explicite de `class="font-display"` aux h1/h2 marketing :
  - `landing.page.html` (h2 "Featured" + h2 "CTA finale")
  - `hero.component.ts` (h1 hero principal)
  - `section-header.component.ts` (h2 "Top services / Top produits / FAQ")
- Pages auth, dashboard, formulaires : pas touché → restent en Inter (la
  police par défaut système Cyna).

### 4. Hors scope

- Les autres `app-section-header` (notamment dashboard) ne sont pas
  affectés car le composant est centralisé : on passe par `font-display`
  uniquement quand voulu côté template. Ici la classe est appliquée
  *systématiquement* dans le composant section-header car il n'est
  utilisé que pour des titres marketing (home, landing, FAQ). Si plus
  tard on veut un section-header non-marketing, il faudra ajouter une
  prop `display: boolean` ou créer un composant séparé.
- Faceplate des popups Apple Pay (B7), des modals checkout (B7), des
  alertes biométrie (B6) : non touchés directement, mais bénéficient
  automatiquement du fix Qurova (puisque la règle globale est levée).

## Fichiers touchés

- `src/app/pages/catalog-hub/catalog-hub.page.{ts,html}` (nouveau)
- `src/app/pages/catalog-hub/catalog-hub.module.ts` (nouveau)
- `src/app/pages/catalog-hub/catalog-hub-routing.module.ts` (nouveau)
- `src/app/pages/catalog-hub/catalog-hub.page.spec.ts` (nouveau)
- `src/app/app-routing.module.ts` (catalog redirect → page hub, retrait
  guards)
- `src/global.scss` (suppression règle globale Qurova)
- `tailwind.css` (ajout `--font-display`)
- `src/app/pages/landing/landing.page.html` (font-display sur h2
  marketing)
- `src/app/shared/components/hero/hero.component.ts` (font-display sur
  h1 hero)
- `src/app/shared/components/section-header/section-header.component.ts`
  (font-display sur h2 sections)
- `src/assets/i18n/{fr,en}.json` (clés `CATALOG_HUB.*`)
