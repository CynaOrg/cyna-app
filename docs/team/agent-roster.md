# Agent Roster — Mobile-Native Mission

**Date** : 2026-05-04
**Référence** : `cyna-app/docs/audits/mobile-native-audit.md`, `cyna-app/docs/audits/roadmap.md`

---

## Règles communes à tous les agents

1. **Worktree Git dédié** créé par le superviseur via `superpowers:using-git-worktrees`. Pas de branchement direct sur le repo principal.
2. **Branche** : `feat/mobile-<scope>` (ex : `feat/mobile-b2-design-system-fix`).
3. **Pas de commit direct sur `main`**. Toujours via PR + review + merge.
4. **Commits atomiques**, messages conventionnels (`feat(...)`, `fix(...)`, `chore(...)`, `test(...)`, `docs(...)`).
5. **Avant de rendre** : `npm run lint` + `npm run test -- --watch=false --browsers=ChromeHeadless` + `npm run e2e:visual -- --project=iphone-15` doivent passer (ou explication claire si non applicable).
6. **Rendu obligatoire** :
   - Diff propre (lien PR ou `git diff` stat)
   - Screenshots Playwright before/after pour les batches visuels (chemins dans `docs/audits/screenshots/playwright/`)
   - Résumé markdown structuré : ce qui a été fait, ce qui reste, blockers rencontrés
7. **Anti-dérive** : si un agent identifie un problème hors scope, il **documente** le problème dans une note mais **ne le corrige pas**. Le superviseur arbitre.
8. **Préservation du design web mobile existant** : aucun changement visuel non explicitement demandé dans la mission. Couleurs, layouts, espacements existants à respecter (sauf bascule explicite #1447E6).

---

## 1. Capacitor-Setup

**Mission unique** : configurer le runtime natif Capacitor — plugins de base, splash, icônes, safe areas, permissions iOS, build et signing pour sideload.

**Scope autorisé** :
- `cyna-app/ios/**` (modifications Info.plist, Assets.xcassets, configurations Xcode)
- `cyna-app/capacitor.config.ts` et fichier JSON synchronisé
- `cyna-app/package.json` (ajout des plugins Capacitor)
- `cyna-app/scripts/sim-ios.sh` (modifications mineures uniquement)
- Création d'un module `cyna-app/src/app/core/native/` pour les wrappers natifs (haptic helper, status bar init, splash control)

**Scope interdit** :
- Code Angular métier (pages, services métier, stores, composants)
- Tailwind / styles globaux
- Routing
- API services

**Livrables attendus** :
- Plugins installés : `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/haptics`, `@capacitor/app`, `@capacitor/browser`, `@capacitor/share`, `@capacitor/network`, plus `@capacitor/assets` en dev
- App icon générée à partir d'un PNG 1024×1024 logo Cyna (cherche dans `src/assets/` ou `cyna-logo` component pour récupérer le SVG, demande au superviseur si introuvable)
- Splash screen natif iOS configuré (image + couleur fond `#1447E6`)
- `Info.plist` enrichi : `NSFaceIDUsageDescription`, restriction orientation portrait, `CFBundleDisplayName` = "Cyna"
- Module `core/native/` avec : `haptic.service.ts` (wrapper `@capacitor/haptics`), `status-bar.service.ts` (wrapper status bar light/dark), `app-lifecycle.service.ts` (wrapper `@capacitor/app` pour deep link futur)
- Tests unitaires Jest sur les wrappers (mock Capacitor)
- Screenshot simulateur du splash + icône avant/après

**Prompt template à dispatcher** :

```
Tu es un agent Capacitor-Setup pour la mission mobile-native CYNA.

CONTEXTE :
- Repo : /Users/tom/Documents/projetsCours/Cyna/cyna-workspace/cyna-app/
- Stack : Angular 20, Ionic 8, Capacitor 8
- Audit complet : docs/audits/mobile-native-audit.md (LIS-LE EN PREMIER)
- Roadmap : docs/audits/roadmap.md
- Spec design : docs/superpowers/specs/2026-05-04-mobile-native-audit-design.md

TON SCOPE STRICT :
- Modifie uniquement : ios/**, capacitor.config.ts, package.json (plugins),
  src/app/core/native/** (à créer), scripts/sim-ios.sh
- Tu ne touches PAS : pages, services métier, stores, composants UI, Tailwind,
  routing, API services. Si tu vois un problème ailleurs, DOCUMENTE-LE dans
  un fichier docs/team/log/notes-capacitor-setup.md mais ne le corrige PAS.

TÂCHE :
[remplir avec les détails du batch B1 ou B9 selon dispatch]

LIVRABLE :
1. Diff complet via PR sur la branche feat/mobile-b1-capacitor-baseline
2. Screenshot simulateur iOS du splash + icône (commande : npm run sim:ios puis
   xcrun simctl io booted screenshot docs/audits/screenshots/sp3/splash-after.png)
3. Tests unitaires Jest sur les wrappers natifs (80% coverage min sur les fichiers
   créés)
4. Résumé markdown structuré : sections "Done", "Skipped & why", "Blockers"

VALIDATION AUTOMATIQUE AVANT RENDU :
- npm run lint
- npm run test -- --watch=false --browsers=ChromeHeadless
- npm run sim:ios (doit lancer l'app sans crash sur le simulateur iPhone 17)
```

---

## 2. Native-UX

**Mission unique** : greffer les patterns d'interaction natifs (transitions, swipe back, pull-to-refresh, haptics, skeletons) au niveau global de l'app et corriger les divergences design system (couleur primaire, police Qurova, routes navbar).

**Scope autorisé** :
- `cyna-app/src/global.scss` et `cyna-app/tailwind.css` (theme inline)
- `cyna-app/src/app/app.component.ts` et `app.component.html` (pour swipe back / transitions au niveau app)
- `cyna-app/src/app/shared/components/navbar/**` (correction routes)
- `cyna-app/src/app/shared/components/` : création d'un composant générique `app-skeleton-list` ou similaire
- `cyna-app/src/app/shared/directives/` : création de directives `ionRefresh`, `hapticOn`
- `cyna-app/src/app/app-routing.module.ts` (uniquement pour ajouter alias `/catalog` et `/account` si choix DP1)

**Scope interdit** :
- Pages métier (Page-Adapter s'en occupe, après lui)
- Logique d'auth, panier, paiement (services dédiés)
- iOS native config (Capacitor-Setup s'en occupe)

**Livrables attendus** :
- Bascule complète `#4f39f6` → `#1447E6` (et toutes les variantes shade)
- Police Qurova appliquée globalement aux titres `h1`, `h2`, et conteneurs spécifiques (audit page par page)
- Routes navbar corrigées (DP1 décidé avec Tom : alias OU correction routerLink)
- Composant skeleton générique réutilisable
- Directive haptique attachable (`<button hapticOn="light">...</button>`)
- Configuration NavController pour transitions natives iOS
- Tests Jest 80% sur les directives et composants créés
- Screenshots Playwright before/after sur les 7 pages publiques

**Prompt template** : adapté du Capacitor-Setup avec scope autorisé/interdit ci-dessus.

---

## 3. Page-Adapter

**Mission** : adapter une **liste fermée de pages** assignée par le superviseur en y appliquant les patterns natifs (skeletons, pull-to-refresh, safe areas, haptics, transitions) en **préservant strictement le design web mobile existant**.

**Scope autorisé** :
- Uniquement les pages explicitement listées dans la mission (ex : "products, services, licenses, product-detail, auth")
- Modifications dans `cyna-app/src/app/pages/<page>/**`
- Utilisation des composants/directives créés par Native-UX (skeleton, hapticOn, ionRefresh)
- Modifications mineures du template HTML pour insérer les éléments natifs

**Scope interdit** :
- Toute page hors liste assignée
- Composants partagés (sauf consommation)
- Services, stores, API
- Tailwind global
- iOS native

**Livrables attendus par page** :
- `ion-content` correctement configuré avec safe areas
- `ion-refresher` sur les listes (products, services, etc.) avec callback `refresh()`
- Skeletons `<app-skeleton-list>` pendant chargement (`isLoading$`)
- Boutons CTA avec `hapticOn="medium"`
- Tests unitaires Jest sur la logique du composant page (mock store + interaction `refresh`)
- Screenshot Playwright after par page

**Anti-dérive** :
- Pas de changement de couleur, layout, ordre des éléments
- Pas de refonte UX
- Si un design est cassé sur le web mobile actuel, le **noter** dans un fichier de log mais ne **pas** corriger

**Prompt template** : adapté avec liste précise des pages assignées et inclusion d'un screenshot before pour référence.

---

## 4. Auth-Mobile

**Mission unique** : implémenter Face ID / Touch ID au login en mode opt-in, avec fallback mot de passe et stockage sécurisé du refresh token.

**Scope autorisé** :
- `cyna-app/src/app/pages/auth/**` (login, register restent inchangés à part le bouton biométrie)
- `cyna-app/src/app/core/auth/**` ou équivalent (création du service biométrie)
- `cyna-app/src/app/core/services/auth.store.ts` (extension pour stockage refresh token biométrique)
- `cyna-app/package.json` (ajout `@capacitor-community/biometric-auth`)
- `cyna-app/ios/App/App/Info.plist` (ajout `NSFaceIDUsageDescription` — coordination avec Capacitor-Setup)

**Scope interdit** :
- Toute autre page
- Stripe, paiement
- Composants navbar / global

**Livrables attendus** :
- Service `BiometricAuthService` wrappant le plugin
- Flow opt-in : après login réussi par mot de passe, demande "Activer Face ID pour les prochaines connexions ?"
- Flow biométrique : sur la page login, si refresh token biométrique présent, bouton "Se connecter avec Face ID" → biométrie OK → `POST /auth/refresh-token` → session restaurée
- Fallback mot de passe : si biométrie KO ou refusée, page login standard
- Tests unitaires Jest 80% sur le service biométrie (mock plugin)
- Screenshots Playwright + simulateur du flow

**Prompt template** : à inclure le détail du flow validé avec Tom.

---

## 5. Payment-Mobile

**Mission unique** : activer Apple Pay sur le checkout via Stripe Payment Element et adapter le checkout mobile pour une UX optimale.

**Scope autorisé** :
- `cyna-app/src/app/pages/checkout/**`
- `cyna-app/src/app/pages/subscribe/**`
- `cyna-app/src/app/shared/components/stripe-payment-element/**`
- `cyna-app/src/app/core/services/checkout-api.service.ts` (uniquement si ajustement signature requis — à confirmer)

**Scope interdit** :
- Cart (Page-Adapter s'en occupe)
- Auth, profil
- iOS native config (sauf pour vérifier `merchant.io.cyna.app` dans Stripe Dashboard, à coordonner)

**Livrables attendus** :
- Apple Pay configuré dans le Payment Element (param `payment_method_types: ['card', 'apple_pay']` côté Stripe.js)
- Détection automatique device iOS pour afficher Apple Pay (Stripe le fait déjà nativement)
- Test sandbox du flow complet : ajout panier → checkout → Apple Pay → confirmation
- Vérification que les abonnements (Stripe Subscriptions) supportent aussi Apple Pay sur la page subscribe
- Tests unitaires sur le composant stripe-payment-element (mock Stripe)
- Screenshot du checkout avec bouton Apple Pay visible
- Coordination Tom pour merchant ID Stripe Dashboard si nécessaire

**Prompt template** : à inclure les credentials Stripe sandbox et le merchant ID.

---

## 6. Test-Engineer

**Mission unique** : couvrir 80% min en tests unitaires Jest sur les services touchés par chaque batch fonctionnel.

**Scope autorisé** :
- Fichiers `*.spec.ts` correspondant aux fichiers modifiés du batch en cours
- Création de mocks dans `cyna-app/src/app/core/mocks/` si nécessaire

**Scope interdit** :
- Toute modification de code applicatif (sauf trivial : ajouter `export` sur une classe pour la rendre testable, et seulement après accord superviseur)
- Tests e2e (reportés en équipe humaine post-soutenance)
- Refacto

**Livrables attendus** :
- Tests unitaires sur les services et composants modifiés
- Mocks réutilisables dans `core/mocks/`
- Résultat `npm run test -- --watch=false --code-coverage` montrant ≥ 80% sur les fichiers du batch
- Résumé : fichiers couverts, pourcentage, tests éventuellement skip et pourquoi

**Prompt template** : à inclure la liste exhaustive des fichiers du batch à couvrir.

---

## Supervisor (moi)

**Responsabilités** :

1. **Avant dispatch** :
   - Sélectionne le batch suivant en respectant le graphe de dépendances
   - Crée le worktree Git via `superpowers:using-git-worktrees`
   - Rédige le prompt complet de l'agent à partir du template du roster
   - Inclut tous les artefacts nécessaires : audit, screenshots before, contraintes spécifiques

2. **Pendant dispatch** :
   - Plusieurs agents en parallèle si fichiers disjoints (jusqu'à 3-4 sub-agents max)
   - Pas d'interruption manuelle sauf sécurité

3. **Après rendu agent** :
   - Review du diff dans le worktree
   - Vérification automatique : lint, test, e2e:visual
   - Comparaison screenshots before/after
   - Si conformité KO : correction directe (si trivial) ou redispatch avec feedback précis
   - Si conformité OK : merge sur la branche d'intégration

4. **Validation Tom** :
   - À chaque milestone (au moins 1 par jour) : ping avec screenshots, diff résumé, items à valider
   - Sur les decision points (DP1, DP2, DP3) : ping AVANT dispatch
   - Sur les batches techniques sans visuel : autonomie complète

5. **Daily log** :
   - Fichier `cyna-app/docs/team/log/YYYY-MM-DD.md` rempli en fin de journée
   - Sections : "Dispatched", "Merged", "Blocked", "Decisions", "Tomorrow"

6. **Sécurité Git** :
   - Aucun push sur `main` direct
   - PR review systématique
   - Worktrees nettoyés après merge

## Format de log quotidien (template)

`docs/team/log/2026-05-XX.md`

```markdown
# Daily Log — 2026-05-XX

## Dispatched
- B1 (Capacitor-Setup) — worktree at /tmp/cyna-app-b1, branch feat/mobile-b1-capacitor-baseline

## Merged
- B0 (audit) into main

## Blocked
- (none)

## Decisions taken with Tom
- DP1 : routes navbar — Tom a tranché : alias dans le routing

## Validations Tom
- 16h45 : approbation visuelle du splash natif (screenshot OK)

## Tomorrow
- Lancer B2 (Design system) en parallèle avec fin B1
- Préparer prompt B3 et B4
```
