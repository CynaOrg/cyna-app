# B6 — Auth-Mobile (Face ID / Touch ID) — notes

## Décisions / déviations vs prompt

### Plugin npm utilisé : `@aparajita/capacitor-biometric-auth@10.x`

Le prompt et l'audit (`docs/audits/mobile-native-audit.md` ligne 165) référencent
`@capacitor-community/biometric-auth`. **Ce package n'existe plus sur npm**
(`E404 Not Found`). Le successeur communautaire maintenu et compatible
Capacitor 8 est `@aparajita/capacitor-biometric-auth` (même API conceptuelle :
`checkBiometry()`, `authenticate()`, énum `BiometryType`).

À mettre à jour dans l'audit si on souhaite refléter la réalité.

### Refresh token : pas de stockage applicatif

L'audit prévoyait de "stocker le refresh token chiffré côté Preferences".
Après lecture du backend / interceptor, **le refresh token est délivré en
cookie `HttpOnly` par `cyna-api`** : il n'est jamais exposé dans le body de
`/auth/login`. Il survit aux relances de l'app via la persistance cookie de
la WebView Capacitor (testée fonctionnelle dans l'audit, point 9).

Conséquence concrète :

- `BIOMETRIC_REFRESH_TOKEN_KEY` est défini et exposé dans `AuthStore`, mais
  rien n'est écrit dedans tant que le backend ne renvoie pas le token en
  body. Forward-compat zéro coût.
- Le flow "login biométrique" se réduit à : prompt OS → succès →
  `POST /auth/refresh-token` (cookie envoyé automatiquement par
  `withCredentials: true`) → session restaurée.

### Fallback en cas de refresh expiré

Si la biométrie est OK mais que `/auth/refresh-token` retourne 401 (token
révoqué/expiré côté serveur), on **purge automatiquement le flag opt-in**
(`disableBiometric()`) : le bouton "Se connecter avec Face ID" disparaît,
l'utilisateur retombe sur le formulaire mot de passe. Évite les boucles
d'échec silencieuses.

## Hors scope confirmé

- Bouton "Désactiver Face ID" dans `dashboard/account` — mentionné dans le
  prompt comme nice-to-have, à traiter dans un futur batch (D-Series ?).
- Page register : aucun changement nécessaire — l'opt-in se déclenche
  uniquement après un login réussi.
- Forgot-password : intouché.

## Vérifications

- `npm run lint` → all files pass
- `npm run test -- --watch=false --browsers=ChromeHeadless` → **327/327 OK**
  (15 tests biometric ajoutés : 13 sur `BiometricAuthService`, 7 sur
  `LoginPage`, 7 sur l'opt-in / login flow d'`AuthStore`)
- `npm run build` → OK (warnings pré-existants seulement)
- `npx cap sync ios` → 9 plugins détectés, biometric auth enregistré

## Info.plist

`NSFaceIDUsageDescription` est déjà présent (B1).
