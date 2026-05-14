# CYNA — App

Application client de la plateforme CYNA : **Angular 20 + Ionic 8 + Capacitor 8**. Un seul codebase qui sert à la fois le web (browser) et le mobile natif (iOS, Android à venir). La séparation se fait au runtime via `isNativeCapacitor()` — pas par fichiers.

## Stack

- Angular 20, Ionic 8, Capacitor 8 (iOS)
- Tailwind CSS v4 (design tokens dans `tailwind.css` via `@theme inline`)
- Signals + nouveau control flow Angular (`@if / @for / @switch`)
- Stripe Elements pour le paiement

## Lancement en local

Prérequis : **Node 20+**. Le backend `cyna-api` doit tourner sur `http://localhost:3000` (voir le README de `cyna-api`).

```bash
git clone https://github.com/CynaOrg/cyna-app.git
cd cyna-app
npm install

# Web (browser) — http://localhost:4200
npm start
```

Le proxy `proxy.conf.json` redirige `/api` vers `http://localhost:3000`, donc rien à configurer côté env pour la version web.

### Mobile (iOS)

Prérequis : **macOS + Xcode** (Xcode 15+ recommandé), un simulateur iOS configuré.

```bash
# Build Angular en mode native + sync vers le projet iOS
npm run build:native

# Lancer sur le simulateur iOS
npx cap run ios

# (ou ouvrir Xcode pour run manuellement)
npx cap open ios
```

L'URL de l'API en mode natif est lue dans `src/environments/environment.native.ts` (par défaut `http://localhost:3000/api/v1`, donc le simu pointe sur ton `cyna-api` local).

## Scripts utiles

```bash
npm start                  # ng serve, web sur :4200
npm run build              # build prod web (output: www/browser/)
npm run build:native       # build + cap sync iOS
npm test                   # tests Karma/Jasmine
npm run lint               # ESLint
npm run e2e                # tests Cypress
```

## Structure

```
src/
  app/
    core/          # services singleton (auth, cart, search, secure-storage, etc.)
    shared/        # composants réutilisables (mobile-header, browser-header, search-modal, ...)
    pages/         # pages routées (auth, dashboard, catalog, cart, checkout, ...)
    home/          # page d'accueil mobile native
    app-routing.module.ts  # guards nativeOnly / browserOnly
ios/               # projet Xcode (généré par Capacitor)
proxy.conf.json    # proxy /api → localhost:3000 en dev web
capacitor.config.ts
tailwind.css       # design tokens
```

## Web vs mobile

- Routes web only : `/landing`, `/products`, `/services`, `/licenses`, `/legal` (guard `browserOnlyGuard`)
- Routes mobile only : `/home`, `/catalog`, `/account/*` (guard `nativeOnlyGuard`)
- Routes partagées : `/auth`, `/cart`, `/checkout`, `/dashboard/*`, `/products/:slug`, etc.

Les composants partagés exposent souvent un input `variant: 'mobile' | 'browser'` pour rendre les deux versions sans mélanger les markups.
