# Sideload iOS — Cyna app sur iPhone perso

**Méthode** : Free signing via Apple ID personnel
**Validité** : 7 jours par build, à re-signer pour prolonger
**Cible** : iPhone Tom + démo Sup De Vinci

## TL;DR

```bash
cd cyna-app
npm run build:ios:release
```

Puis Cmd+R dans Xcode après avoir branché l'iPhone.

---

## Prérequis

- macOS avec Xcode 15+ installé (App Store)
- CocoaPods (`brew install cocoapods` si manquant)
- Apple ID personnel (gratuit suffit)
- iPhone iOS 16+ avec un câble USB / USB-C
- Le repo `cyna-app` cloné, `npm install` fait

## Setup initial Apple ID dans Xcode (une fois)

1. Xcode -> Settings -> Accounts -> `+` -> Apple ID
2. Saisir email + password Apple ID
3. Le profil "Personal Team" apparaît automatiquement, c'est lui qu'on utilisera pour signer

## Setup initial iPhone (une fois)

1. Branche l'iPhone, déverrouille, "Trust This Computer" si demandé
2. iPhone -> Settings -> Privacy & Security -> Developer Mode -> activer
3. iPhone redémarre, confirmer en post-redémarrage

---

## Workflow build + run

### 1. Lancer le build

```bash
npm run build:ios:release
```

Ce script enchaîne :
- `npm run build -- --configuration production` (Angular bundle)
- `npx cap sync ios` (copie le bundle web dans `ios/App/App/public`)
- `pod install` si Podfile présent
- `npx cap open ios` (ouvre Xcode)

### 2. Configuration Xcode

1. Project navigator (sidebar) -> sélectionner `App`
2. Onglet **Signing & Capabilities**
3. Champ **Team** -> sélectionner ton Personal Team Apple ID
4. **Bundle Identifier** : `io.cyna.app` (par défaut)
   - Si conflit ("already in use"), renommer en `io.cyna.app.tom` (ou prénom)
5. Cocher **Automatically manage signing** si pas déjà fait

### 3. Run sur iPhone

1. Connecter l'iPhone via USB
2. Dans la toolbar Xcode, sélectionner ton iPhone (à côté du bouton play)
3. Cmd+R (ou bouton Play)
4. Première erreur attendue sur l'iPhone : "Untrusted Developer"
5. iPhone -> Settings -> General -> VPN & Device Management
6. Sous "Developer App" -> ton Apple ID -> **Trust**
7. Relancer Cmd+R dans Xcode

L'app s'installe, le splash Cyna apparaît, l'app charge.

---

## Validation démo (12 points)

Checklist à exécuter sur l'iPhone après install :

- [ ] App lance sans crash, splash Cyna visible (fond `#4f39f6`)
- [ ] Bottom navbar 4 tabs (Home, Catalog, Cart, Account)
- [ ] Login avec compte test OK (`/m/auth/login`)
- [ ] Register OK (`/m/auth/register`)
- [ ] Face ID opt-in proposé après le premier login (modal native)
- [ ] Catalog hub `/m/catalog` charge produits + services + licences
- [ ] Pull-to-refresh sur la liste produits déclenche un re-fetch
- [ ] Page produit affiche détail + bouton Share natif fonctionne
- [ ] Cart -> checkout -> Apple Pay disponible si carte dans Wallet
- [ ] Bannière offline visible quand Wi-Fi/cellulaire coupé
- [ ] Cache produits offline : on revoit les produits déjà visités hors-ligne
- [ ] Deep link `cyna://catalog` ouvre l'app sur le hub

Bonus :
- [ ] `cyna://product/<slug>` route vers la fiche produit
- [ ] Statut bar lisible (texte sombre sur fond clair) sur toutes les pages
- [ ] Haptics au clic CTA principal

---

## Resign après 7 jours

Le certificat free signing expire chaque semaine. Symptôme : l'app ne se lance plus.

```bash
npm run build:ios:release
```

Connecter l'iPhone, Cmd+R dans Xcode, c'est rebuilt et re-signé pour 7 jours.

Pas besoin de désinstaller l'ancienne version : Xcode l'écrase.

---

## Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `No code signing identities found` | Apple ID pas ajouté à Xcode | Xcode -> Settings -> Accounts |
| `Bundle ID already used` | Quelqu'un d'autre a déjà signé `io.cyna.app` | Changer en `io.cyna.app.tom` dans Signing |
| `Untrusted Developer` à l'install | Profile pas encore validé sur iPhone | Settings -> General -> VPN & Device Management -> Trust |
| Build fail : `pod install error` | CocoaPods absent ou version trop vieille | `brew install cocoapods` ou `gem install cocoapods` |
| `No registered devices` | iPhone pas en Developer Mode | iPhone Settings -> Privacy & Security -> Developer Mode |
| Splash bloqué | `launchAutoHide` désactivé ou bug app | Vérifier console Xcode, `npm run build && npx cap sync ios` |
| Apple Pay grisé en checkout | Pas de carte dans Wallet ou domain non vérifié | Voir notes-n4.md (config Stripe Dashboard) |
| Deep link n'ouvre pas l'app | URL scheme pas pris en compte | Désinstaller l'app, rebuild, réinstaller |
| `xcodebuild: error: Provisioning profile required` | Team Personal pas sélectionné | Re-cocher "Automatically manage signing" + Team |
| App crash au lancement | Bundle web pas synchronisé | `npx cap sync ios` puis Cmd+R |

### Logs utiles

```bash
# Logs iPhone connecté
xcrun devicectl device list devices
xcrun devicectl device process launch --device <UUID> io.cyna.app

# Logs simulator
xcrun simctl spawn booted log stream --predicate 'process == "App"'
```

---

## Apple Pay live

Pour activer Apple Pay en démo :

1. Suivre `docs/team/log/notes-n4.md` pour la config Stripe Dashboard (domain Apple Pay verified)
2. Avoir une carte dans Wallet sur l'iPhone
3. Vérifier que `STRIPE_PUBLISHABLE_KEY` pointe vers la bonne clé (test/live)

---

## Simulateur (debug)

Pour tester sur simulateur sans iPhone :

```bash
npm run sim:ios
# Par défaut iPhone 17, override via SIM_DEVICE
SIM_DEVICE="iPhone 16 Pro" npm run sim:ios
```

Note : Apple Pay et biométrie ne sont pas réalistes en simulateur. Le sideload sur iPhone reste la cible démo.
