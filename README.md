# CYNA — App (Angular + Ionic, web + mobile)

Application client-facing : Angular 20 + Ionic 8 + Capacitor 8 (iOS + Android), un seul codebase pour le web et le mobile.

## Stack

| Composant     | Version | Rôle                          |
| ------------- | ------- | ----------------------------- |
| Angular       | 20      | framework                     |
| Ionic         | 8       | composants UI mobile-first    |
| Capacitor     | 8       | wrapper natif iOS/Android     |
| Tailwind CSS  | 4       | styling (jamais de CSS natif) |
| ngx-translate | —       | i18n FR/EN                    |
| Cypress       | 15      | tests e2e                     |

## Démarrage rapide

```bash
git clone https://github.com/CynaOrg/cyna-app.git
cd cyna-app
npm install

# Backend doit tourner en parallèle sur localhost:3000 (voir cyna-api)
ng serve
# → http://localhost:4200/
```

Le `proxy.conf.json` redirige les appels `/api/v1/**` vers `http://localhost:3000`. Si le backend est sur un autre host, modifie ce fichier.

## Comptes de test

Une fois la base seedée (voir `cyna-api/README.md` → `npm run seed:dev`) :

- **Utilisateur (front public)** : `tom.user@cyna.local` / `User1234!`

## Tests

```bash
ng lint                 # ESLint
ng test --no-watch      # Karma + Jasmine (545 tests)
npx cypress run         # E2E (6 specs, 15 tests)
```

Cypress mock tous les appels HTTP — pas besoin de backend pour les e2e.

## Build production

```bash
ng build                # → www/browser/
```

## Mobile (iOS)

```bash
ng build
npx cap sync            # synchronise le build web vers ios/android
npx cap run ios         # lance dans le simulateur iOS
npx cap open ios        # ouvre Xcode
```

L'Android natif est déclaré dans `capacitor.config.ts` mais pas encore scaffolded.

## Architecture web/mobile

Un seul codebase. La séparation est runtime via `isNativeCapacitor()` :

- Routes `/landing`, `/products`, `/services`, etc. : web only (`browserOnlyGuard`)
- Route `/home` : mobile only (`nativeOnlyGuard`)
- Pages partagées (`/auth`, `/cart`, `/checkout`, `/dashboard`, …) : utilisent `@if (isNative) {…} @else {…}` ou la prop `variant="mobile|browser"`

Voir `CLAUDE.md` à la racine du workspace pour les règles détaillées.
