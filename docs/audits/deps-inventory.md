# Inventaire des dépendances et plugins natifs

> Document de travail intermédiaire. Sera fold dans `mobile-native-audit.md` (L1) puis supprimé.

## 1. Stack actuelle (`package.json`)

### Angular & Ionic
- Angular 20.x
- Ionic Angular 8.x
- ionicons 7.x
- RxJS 7.8
- zone.js 0.15
- TypeScript 5.9

### Capacitor 8 (core + plugins installés)
- `@capacitor/core` 8.0.1
- `@capacitor/cli` 8.0.1
- `@capacitor/ios` 8.0.1
- `@capacitor/android` 8.0.1
- `@capacitor/preferences` 8.0.0 ← **seul plugin natif déclaré**

Le `capacitor.config.json` iOS ne référence que `PreferencesPlugin`.

### Tooling et utilitaires
- Tailwind CSS 4.1
- @tailwindcss/postcss 4.1
- @stripe/stripe-js 8.7
- @ng-icons/core + @ng-icons/phosphor-icons 29.x
- @ngx-translate/core + http-loader 17.x
- @fontsource/inter 5.2 ✅
- @fontsource/dm-sans 5.2 (utilisation à confirmer)
- @fontsource/syne 5.2 (utilisation à confirmer)
- chart.js 4.5
- express 5.2 + server.js (SSR ?)
- patch-package 8.0 (postinstall)

### Polices
- ✅ **Inter** : via `@fontsource/inter` — police corps cadrage
- ✅ **Qurova** : présente comme fichier custom `src/assets/fonts/qurova-bold.otf` + `@font-face` dans `src/global.scss`. **Utilisée uniquement dans `hero.component.ts` et `contact.page.html`** via styles inline. À étendre aux titres globaux pour respecter le branding cadrage.

## 2. Plugins Capacitor à ajouter

Pour atteindre les fonctionnalités validées dans le brainstorming (spec §3.1) :

| Plugin | Package npm | Feature | Sous-projet cible |
|---|---|---|---|
| Splash screen | `@capacitor/splash-screen` | Splash natif iOS (vs Angular custom actuel) | SP3 — Capacitor-Setup |
| Status bar | `@capacitor/status-bar` | Couleur status bar + light/dark | SP3 |
| Haptics | `@capacitor/haptics` | Vibration légère sur taps importants | SP2 — Native-UX |
| App | `@capacitor/app` | Lifecycle, deep link handler | SP4 — Native-UX |
| Browser | `@capacitor/browser` | In-app browser pour CGU/Privacy/redirections externes | SP3 |
| Share | `@capacitor/share` | Partage natif (`navigator.share` wrapper) | SP4 |
| Network | `@capacitor/network` | Détection online/offline pour mode dégradé | SP4 |
| Biométrie | `@capacitor-community/biometric-auth` (community) | Face ID / Touch ID | SP4 — Auth-Mobile |
| Stripe iOS | `@stripe/stripe-react-native` n'est pas pertinent. Apple Pay s'active via `@stripe/stripe-js` côté web + config Stripe Dashboard | Apple Pay | SP4 — Payment-Mobile |

Plus un outil de génération d'assets natifs (icônes + splash images) :

- `@capacitor/assets` (devDependency, dev tool)

## 3. Inspection iOS native config

### `ios/App/App/Info.plist` — état actuel

Strict minimum Capacitor template :
- `CFBundleDisplayName` = `cyna-app` (à customiser → `Cyna` ou `CYNA`)
- `LSRequiresIPhoneOS` = true
- `UILaunchStoryboardName` = `LaunchScreen` (storyboard par défaut, à customiser avec branding)
- `UIRequiredDeviceCapabilities` = `armv7` ⚠️ obsolète mais non-bloquant
- Orientations : portrait + paysage (à restreindre à portrait pour app mobile)

### Manquants à ajouter

Pour les features natives validées :

| Clé | Valeur | Pourquoi |
|---|---|---|
| `NSFaceIDUsageDescription` | "Cyna utilise Face ID pour vous connecter rapidement et sécuriser votre compte." | Requis par iOS dès qu'on appelle l'API Local Authentication |
| `CFBundleURLTypes` | URL scheme `cyna://` | Deep linking (sera complété par associated domains pour Universal Links si on les active) |
| `NSAppTransportSecurity` | (selon environnement) | Si l'API dev n'est pas en HTTPS, sinon non nécessaire |

### Capacitor config

`capacitor.config.ts` (TS) et `ios/App/App/capacitor.config.json` (JSON sync'd) :

```json
{
  "appId": "io.cyna.app",
  "appName": "cyna-app",
  "webDir": "www/browser",
  "packageClassList": ["PreferencesPlugin"]
}
```

À enrichir avec :
- Configuration `SplashScreen` : durée, fond, image
- Configuration `StatusBar` : couleur initiale
- `appName` à passer en `CYNA` ou `Cyna`

### Ressources iOS

- App icon : à vérifier dans `ios/App/App/Assets.xcassets` — probablement icône Capacitor par défaut
- Splash assets : à vérifier dans `Assets.xcassets`

## 4. Build pipeline

### Build web actuel
- `npm run build` → `ng build` → output `www/browser/`
- `server.js` (Express) : sert l'app en mode SSR / prod web — **non pertinent pour le build natif** (Capacitor lit directement `www/browser`)

### Build natif iOS (à valider)
- Workflow : `npm run build` → `npx cap sync ios` → `npx cap open ios` → run sur simulateur/device depuis Xcode
- **CocoaPods requis** sur la machine (vérifier dans Task 5)

## 5. Patches et postinstall

`patch-package` + dossier `patches/` à la racine. À inspecter dans Task 5 si on a un bug build pour identifier d'éventuels patches Ionic/Angular custom.

## 6. Exigences cadrage techniques croisées

| Exigence cadrage | État actuel | Action |
|---|---|---|
| Stack Angular Ionic + Capacitor | ✅ | aucune |
| Couleur primaire `#1447E6` | ❌ utilise `#4f39f6` | basculer (SP2) |
| Police Qurova titres | ⚠️ chargée mais sous-utilisée | étendre usage globalement (SP2) |
| Police Inter corps | ✅ | aucune |
| HTTPS obligatoire | ✅ Stripe + cyna-api en HTTPS | aucune |
| JWT + refresh tokens | ✅ implémenté | aucune |
| 4 onglets bottom (mobile) | ✅ navbar OK | corriger routes cassées (SP2) |
| Splash écran | ⚠️ Angular custom | basculer Capacitor (SP3) |
| Pas de stores | ✅ aligné | aucune |
| WCAG 2.1 niveau A | À auditer | check rapide en SP2 |

## 7. Synthèse — décisions de plugins

**À installer en priorité (sous-projet 3 - Capacitor-Setup)** :
```
@capacitor/splash-screen @capacitor/status-bar @capacitor/app @capacitor/haptics @capacitor/browser @capacitor/share @capacitor/network @capacitor/assets
```

**À installer pour features natives spécifiques (sous-projet 4)** :
```
@capacitor-community/biometric-auth
```

**Pas besoin d'installer** :
- Apple Pay : @stripe/stripe-js suffit, configuration côté Stripe Dashboard
- Aucun plugin Camera/QR (hors scope)
- Aucun plugin Push (hors scope, requiert Apple Dev Program)

## 8. Risques identifiés sur les deps

- ⚠️ **Tailwind v4 inline theme** : pattern correct pour contourner Shadow DOM Ionic, mais peut surprendre en cas de bug visuel. À documenter dans le roster d'agent Native-UX.
- ⚠️ **`@fontsource/dm-sans` et `@fontsource/syne`** : à supprimer si non utilisés (réduction bundle).
- ⚠️ **`server.js` (Express SSR)** : irrelevant pour le build natif, mais `webDir: www/browser` pointe vers le sous-dossier généré par le SSR. À vérifier que `www/browser/index.html` est bien le bundle SPA et pas un index serveur.
