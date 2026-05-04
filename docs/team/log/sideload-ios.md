# Sideload iOS — Cyna app sur iPhone perso

**Audience** : Tom (et tout dev de la team équipé d'un Mac + iPhone)
**Méthode** : Free signing via Apple ID personnel (pas besoin du programme Apple Developer 99$/an)
**Validité** : 7 jours par build, à re-signer pour prolonger
**Pré-requis** : Xcode installé, iPhone connecté en USB, Apple ID Apple existant

---

## TL;DR

```bash
cd cyna-app
npm run build:ios:release
```

Le script build la prod + sync Capacitor + ouvre Xcode. Ensuite, **manipulations Xcode** (voir §3).

---

## 1. Prérequis machine

| Outil | Vérification | Commande |
|---|---|---|
| Xcode 15+ | `xcode-select -p` retourne un path | `xcode-select -p` |
| CocoaPods | `pod --version` retourne `1.16+` | `brew install cocoapods` (déjà fait B1) |
| Node 20+ | `node --version` ≥ 20 | déjà installé |
| iPhone iOS 17+ | Dans Settings → General → About | physique |

## 2. Setup initial Apple ID dans Xcode (à faire UNE fois)

1. Ouvrir Xcode
2. Menu `Xcode → Settings → Accounts`
3. Bouton `+` en bas à gauche → `Apple ID`
4. Saisir email + password Apple ID Tom
5. Le compte apparaît avec un team `(Personal Team)` — c'est ce qu'on utilise pour le free signing

## 3. Build et déploiement (workflow nominal)

### Étape 1 — Build et ouverture Xcode

Depuis le dossier `cyna-app/` :

```bash
npm run build:ios:release
```

Le script :
- Build l'Angular en mode production (`ng build --configuration production`)
- Synchronise Capacitor iOS (`npx cap sync ios`)
- Lance `pod install` si nécessaire
- Ouvre Xcode automatiquement avec le projet `App.xcworkspace`

### Étape 2 — Configuration Xcode (premier lancement uniquement)

Dans Xcode :

1. **Sélectionner le target** : dans la sidebar gauche, clic sur `App` (le projet bleu en haut), puis dans le panneau central, sélectionner le target `App`
2. **Onglet `Signing & Capabilities`** :
   - **Automatically manage signing** : ✅ coché
   - **Team** : sélectionner `<Ton nom> (Personal Team)`
   - **Bundle Identifier** :
     - Par défaut : `io.cyna.app`
     - **Si Xcode rouge "Failed to register bundle identifier"** : ce bundle est déjà pris par un autre dev Apple. Le changer en `io.cyna.app.tom` (ou n'importe quel suffix unique)
   - Si tout est vert → setup OK

### Étape 3 — Connecter l'iPhone

1. Câble USB-C vers iPhone
2. Sur iPhone : "Faire confiance à cet ordinateur ?" → **Trust**
3. Settings → Privacy & Security → Developer Mode → **activer** (iOS 16+)
4. iPhone redémarre, valider Developer Mode après reboot

### Étape 4 — Lancer l'app

1. Dans Xcode, en haut, à côté du bouton play : sélecteur device
2. Choisir le nom de ton iPhone (pas un simulateur)
3. **Cmd+R** ou bouton play ▶
4. Première fois : Xcode demande d'unlock le keychain → entrer le password macOS
5. Build, deploy, lancement automatique

### Étape 5 — Trust du certificat sur iPhone

**Première fois uniquement** : l'app crashe au lancement avec "Untrusted Developer".

Sur l'iPhone :
1. Settings → General → VPN & Device Management
2. Section "Developer App" → tap sur `Apple Development: <ton.email>`
3. Bouton **Trust** → confirmer
4. Re-lancer l'app depuis le springboard (Cmd+R dans Xcode aussi OK)

---

## 4. Validation de la démo (checklist)

À chaque resign, vérifier rapidement :

- [ ] L'app lance sans crash
- [ ] Splash screen Cyna affiche le bon logo + couleur indigo `#1447E6`
- [ ] Bottom tab bar : Accueil / Catalogue / Panier / Compte
- [ ] Login + register marchent
- [ ] Face ID : se connecter, accepter l'opt-in, déconnexion, re-login Face ID OK
- [ ] Catalog : pull-to-refresh sur products
- [ ] Page produit : tap share → sheet iOS native s'ouvre
- [ ] Checkout : Apple Pay visible si carte dans Wallet (sinon CB seule, normal)
- [ ] Bannière offline : Settings → Wi-Fi off → bannière rouge en haut
- [ ] Cache : offline + force-quit + relance → produits/panier toujours là
- [ ] Deep link : Safari → tape `cyna://catalog` → l'app s'ouvre sur /products

---

## 5. Resign après expiration 7 jours

Le certificat free signing expire 7 jours après le build. Symptômes : l'app refuse de se lancer ou est grisée sur le springboard.

Workflow de resign :

```bash
cd cyna-app
npm run build:ios:release
```

Puis dans Xcode : Cmd+R sur l'iPhone connecté. Le re-déploiement écrase la version expirée et rafraîchit le certificat.

---

## 6. Troubleshooting

| Problème | Cause probable | Solution |
|---|---|---|
| "Failed to register bundle identifier" | Bundle pris par un autre dev | Changer `io.cyna.app` → `io.cyna.app.tom` dans Signing |
| "Could not launch App" / Untrusted Developer | Certificat pas encore trusté sur iPhone | Settings → General → VPN & Device Management → Trust |
| App grisée au lancement | Certificat 7 jours expiré | Resign (`npm run build:ios:release` + Cmd+R) |
| Build Xcode très lent (5+ min) | Première compilation, indexation, dérivedData | Patienter, les builds suivants sont en quelques secondes |
| Apple Pay button absent | Pas de carte dans Apple Wallet OU mode test sans domain validé | Ajouter une carte test sur l'iPhone OU valider le domain Stripe (cf. `notes-b7-apple-pay.md`) |
| Face ID prompt n'apparaît pas | Face ID pas configuré sur l'iPhone OU Info.plist sans `NSFaceIDUsageDescription` | Configurer Face ID dans Settings → Face ID iOS, et vérifier le Info.plist |
| Deep link `cyna://` ne marche pas | URL scheme pas synchronisé | `npx cap sync ios` puis re-build dans Xcode |

---

## 7. Notes spécifiques CYNA

- **Bundle ID** : `io.cyna.app` (cf. `capacitor.config.ts`). Modifiable en `io.cyna.app.<initiales>` si conflit.
- **Display name** : `Cyna` (Info.plist `CFBundleDisplayName`)
- **Plugins natifs actifs** : Preferences, App, Browser, Haptics, Network, Share, Splash Screen, Status Bar, Biometric Auth (9 au total)
- **Icône** : générée à partir de `resources/logo.svg` via `@capacitor/assets`
- **Splash** : couleur `#1447E6` + logo Cyna (config dans `capacitor.config.ts`)
- **URL scheme** : `cyna://` (Info.plist `CFBundleURLTypes`)
- **Orientation** : portrait verrouillé sur iPhone (paysage autorisé sur iPad)
- **Backend prod** : `cyna-api.up.railway.app` — l'app de prod pointe dessus en HTTPS (CORS à valider si conflit avec scheme `capacitor://localhost`)
