# N7 — Notes & blockers

## Build iOS

- `npx cap add ios` régénère le scaffold sans souci.
- Capacitor 8 utilise SwiftPM par défaut (pas de Podfile dans cette config).
- Les 9 plugins natifs sont détectés et inclus via `Package.swift`.
- Warning bénin : `@capacitor/core@8.3.1` vs `@capacitor/ios@8.0.1`. Pas bloquant.
- xcodebuild iOS sim : OK en 29s la première fois, 5s incrémental.

## Assets

- Source utilisée : `src/assets/icon/icon.svg` (logo Cyna primary `#4F39F6`).
- Copie en `resources/icon.svg` + `resources/logo.svg` pour @capacitor/assets.
- 7 assets générés (icône 512@2x + 6 splashs universal any-any).
- Le logo source est déjà au bon ratio carré et sans padding excessif.

## Info.plist

- `CFBundleDisplayName` = `Cyna` (déjà défini par `appName` de capacitor.config.ts).
- Ajouté `NSFaceIDUsageDescription` (FR) pour le module biometric-auth.
- Ajouté `CFBundleURLTypes` avec scheme `cyna` pour deep links.
- Restreint orientation iPhone à portrait uniquement, iPad reste multi-orient.
- Rien touché à `NSAppTransportSecurity` — l'API prod est en HTTPS.

## Validation simulateur

- Build + run sur iPhone 17 sim : OK.
- Splash Cyna primary `#4f39f6` visible au cold start.
- Home page, bottom navbar 4 tabs, charts, images : OK.
- Status bar texte sombre sur fond clair : OK.

### Deep link

- Le scheme `cyna://` est bien enregistré au niveau OS (le badge `< Safari` apparaît
  quand on `openurl cyna://catalog`, prouvant que l'app est bien le handler).
- Mais le routeur Angular ne pivote pas vers `/m/catalog` après le deep link
  dans cette session — l'app reste sur la home. À investiguer côté
  `DeepLinkService` (B8) en suivi, hors scope N7.
- Le service `resolve('cyna://catalog')` mappe correctement vers `/m/catalog`
  dans les tests unitaires (416/416 OK).
- Hypothèse : `App.appUrlOpen` listener nécessite un routing kick côté
  app-shell post-bootstrap. Suivi à ouvrir.

## Blockers pour Tom (sideload iPhone)

Aucun blocker bloquant. À l'install sur l'iPhone :

1. Free signing OK avec Apple ID Personal Team.
2. Bundle ID `io.cyna.app` peut entrer en conflit si déjà signé par un autre
   Apple ID — fallback vers `io.cyna.app.tom`.
3. Activer Developer Mode sur l'iPhone (Privacy & Security).
4. Apple Pay : besoin de domain verification Stripe Dashboard (cf notes-n4).

## Web invariant

- `git diff origin/main HEAD` sur `src/app/pages/`, `src/app/shared/`,
  `src/app/core/`, `src/global.scss`, `tailwind.css`, `capacitor.config.ts`,
  `src/main.ts`, `src/index.html`, `app.component.*`, routing : empty.

## Tests

- Lint : All files pass linting.
- Unit : 416/416 SUCCESS (Chrome Headless).
