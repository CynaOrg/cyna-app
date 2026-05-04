# Sous-projet 1 — Audit Mobile-Native & Setup Workflow Team

**Date** : 2026-05-04
**Auteur** : Claude (superviseur) avec Tom
**Cible** : démo soutenance dans 3 semaines (objectif effort : fin de semaine en cours, ~10 mai 2026)
**Statut** : Design — en attente de validation utilisateur

---

## 1. Contexte

CYNA est une plateforme e-commerce B2B (SaaS cybersécurité + produits physiques) construite par une équipe de 4 (Bachelor 3 Sup De Vinci). Le workspace contient trois projets :

- `cyna-api` : backend NestJS microservices (figé, modifiable seulement si gap fonctionnel justifié)
- `cyna-backoffice` : back-office web (hors scope de ce projet)
- `cyna-app` : application Ionic Angular — **scope unique de ce projet**

`cyna-app` est aujourd'hui une web-app mobile (servie via `ionic serve`) au design jugé clean. Capacitor est configuré (`appId: io.cyna.app`), le dossier `ios/` existe, le dossier `android/` n'existe pas. L'application n'a jamais été buildée et exécutée comme app native ; elle ne dispose d'aucun pattern d'interaction mobile-native (gestures, transitions, plugins natifs).

**Mission globale** : transformer `cyna-app` en vraie app mobile-native iOS, installable sur l'iPhone perso de Tom via Xcode (sideload free signing), avec un rendu et un feel comparables à une app store-ready, en préservant intégralement le design web mobile existant.

## 2. Cadre validé en brainstorming

| Décision | Valeur |
|---|---|
| Design web mobile actuel | **Source d'inspiration, on n'y touche pas** |
| Plateformes cibles | iOS prioritaire (simulateur + sideload iPhone). Android : code propre, test sur device d'ami plus tard. **Pas d'install Android Studio** |
| Type de team | Sous-agents Claude Code dispatchés en parallèle par le superviseur (= moi). Pas d'humains, pas d'agents cloud schedulés |
| Mode supervision | **Mode D hybride** : autonomie sur technique pur, validation utilisateur sur visuel + décisions architecturales |
| Backend `cyna-api` | Modifiable uniquement si gap fonctionnel justifié par le cadrage ou un besoin natif réel |
| Stores | Pas de publication App Store / Play Store. Sideload uniquement |
| Tests | Unitaires Jest 80% min sur services touchés. E2E Cypress reportés (faits par l'équipe humaine en fin de projet) |
| Cadence | Bombarder. Plusieurs agents en parallèle, milestones quotidiens, fin de semaine visée |
| Git | Worktrees + branches `feat/mobile-<scope>` + PR/review/merge propre. **Pas de push direct sur `main`** |

## 3. Périmètre fonctionnel natif

### 3.1 Inclus (validé)

**Indispensables natifs** :
- Splash screen + icône d'app (`@capacitor/splash-screen`, assets resources)
- Status bar stylée + safe areas iOS (notch, home indicator)
- Swipe back natif (depuis le bord gauche) sur les écrans secondaires
- Pull-to-refresh sur listes (produits, commandes, licences)
- Transitions de page natives (slide latéral pour navigation, modal montant)
- Haptic feedback (`@capacitor/haptics`) sur actions importantes
- Loading skeletons pour remplacer les spinners web

**Features natives à valeur** :
- Face ID / Touch ID au login (`@capacitor-community/biometric-auth`)
- Apple Pay via Stripe sur le checkout
- Deep linking / Universal Links (lien produit ouvre l'app sur la bonne page)
- Partage natif (`navigator.share`)
- Mode hors-ligne minimal (cache produits + panier persistant via Capacitor Preferences)

### 3.2 Exclu

- Push notifications APNs (nécessite Apple Developer Program payant)
- Camera / scan QR code (pas pertinent cyber B2B)
- Géolocalisation (pas pertinent)
- Publication stores

## 4. Livrables du sous-projet 1

| # | Livrable | Path | Description |
|---|---|---|---|
| **L1** | Rapport d'audit | `cyna-app/docs/audits/mobile-native-audit.md` | État technique actuel détaillé : inventaire pages/services/composants, screenshots simulateur iOS du build actuel, liste des plugins Capacitor manquants, gap analysis page par page (ce qui marche / ce qui manque pour être natif), évaluation cyna-api côté mobile (endpoints biométrie, refresh token, Apple Pay, deep links) |
| **L2** | Roadmap accélérée | `cyna-app/docs/audits/roadmap.md` | Découpage en batches numérotés, dépendances entre batches (graph), assignation aux profils d'agents, milestones datés, points de validation Tom, fenêtre de fin visée (fin de semaine, filet 3 semaines) |
| **L3** | Roster d'agents | `cyna-app/docs/team/agent-roster.md` | Profils détaillés des 6 sous-agents (mission précise, scope autorisé, anti-dérive explicite, livrables attendus, format de rendu) |
| **L4** | Setup monitoring visuel | `cyna-app/e2e/visual/` (configs + helpers) + scripts npm | Playwright config viewport iPhone/Android, helper `screenshotPage(route)`, script `npm run sim:ios` qui build + ouvre simulateur Xcode + prend screenshots automatisés |

## 5. Méthode d'audit (étapes d'exécution du sous-projet 1)

1. **Lecture cadrage** : lire `cadrage.pdf` à la racine du workspace pour le périmètre fonctionnel attendu et les contraintes académiques
2. **Inventaire code statique** : walkthrough complet de `cyna-app/src/app` (pages, services, composants partagés, routing, state management, intercepteurs HTTP, gestion auth, appels API)
3. **Inventaire dépendances** : audit `package.json` — versions Ionic/Angular/Capacitor, plugins natifs déjà installés vs manquants
4. **Build iOS de l'existant** : `npx cap sync ios` puis ouverture Xcode, run sur simulateur (iPhone 15 par défaut), screenshots de chaque écran principal pour mesurer l'écart visuel et fonctionnel
5. **Gap analysis** : pour chaque page identifiée, lister précisément ce qui manque (gestures, transitions, safe area, skeletons, haptics, plugin natif)
6. **Inventaire backend mobile-relevant** : revue `cyna-api` — endpoints auth (compatibilité refresh token mobile, support biométrie), Stripe (config Apple Pay), deep-link tokens éventuels
7. **Setup Playwright + helpers** : configurer Playwright avec viewports iPhone et Android, écrire les helpers de screenshot mobile, script `sim:ios` automatisant build + lancement simulateur
8. **Rédaction L1 + L2 + L3** : produire les 3 documents en se basant sur l'audit
9. **Commit + branche** : tout le travail du sous-projet 1 sur `feat/mobile-audit-setup`, PR vers `main`, validation Tom, merge

## 6. Roster d'agents spécialisés (validé)

| Agent | Mission unique | Scope autorisé | Anti-dérive |
|---|---|---|---|
| **Capacitor-Setup** | Configuration plugins natifs Capacitor, splash, icônes, safe areas, permissions iOS, build iOS | `cyna-app/ios/`, `capacitor.config.ts`, `package.json` plugins, `src/app/core/native/*` | Ne touche pas au code Angular métier (pages, services métier) |
| **Native-UX** | Greffe gestures (swipe back, pull-refresh), transitions, haptics, skeletons sur les pages existantes | Composants UX globaux, directives, `app.component`, configuration `IonicModule.forRoot` | Ne change ni le design visuel, ni les couleurs, ni le layout des pages |
| **Page-Adapter** | Adapte les pages web mobile en pages natives — un agent par batch de pages | Une liste fermée de pages assignées au batch | Suit strictement le design web mobile existant comme baseline. Pas de refonte visuelle |
| **Auth-Mobile** | Face ID/Touch ID + refresh token + stockage natif sécurisé via Capacitor Preferences/Keychain | `src/app/pages/auth/*`, `src/app/core/auth/*`, plugin biométrie | Ne touche qu'à l'auth, n'élargit pas |
| **Payment-Mobile** | Apple Pay via Stripe + adaptation du checkout mobile | `src/app/pages/checkout/*`, intégration Stripe Apple Pay | Reste sur le checkout, ne touche pas au panier |
| **Test-Engineer** | Tests unitaires Jest 80% min sur les services touchés par chaque batch | Fichiers `*.spec.ts` correspondants au batch en cours | Tests seulement, pas de refacto applicatif |

**Règles communes à tous les agents** :
- Travail isolé en worktree Git (skill `superpowers:using-git-worktrees`)
- Branche dédiée `feat/mobile-<scope>`
- Rendu obligatoire : diff propre + screenshots Playwright des écrans touchés + résumé en markdown
- Aucun commit direct sur `main`

## 7. Workflow de supervision

### 7.1 Cadence de dispatch

- 2 à 4 agents en parallèle quand les tâches sont indépendantes (fichiers disjoints)
- Le superviseur (moi) review chaque diff avant validation
- Si conformité OK : merge dans la branche d'intégration du sous-projet
- Si conformité KO : redispatch avec feedback précis ou correction directe par le superviseur

### 7.2 Milestones et validation Tom

- **1 milestone visuel par jour minimum** : à chaque milestone, build iOS simulateur + screenshots → ping Tom pour validation
- **Decision points** : tout choix architectural non-trivial → ping Tom AVANT dispatch
- **Daily log** : `cyna-app/docs/team/log/YYYY-MM-DD.md` — ce qui a été dispatché, mergé, bloqué chaque jour

### 7.3 Monitoring visuel (combo validé)

- **Niveau 1 — Playwright Chromium viewport mobile** : itération rapide pendant le dev. Chaque agent screenshot ses écrans modifiés
- **Niveau 2 — Simulateur iOS via Xcode** : checkpoint à chaque milestone du superviseur. Validation rendu natif réel
- **Niveau 3 — Android** : reporté, test sur device d'ami en fin de projet

### 7.4 Discipline Git

- Une branche `feat/mobile-<scope>` par batch
- PR systématique vers `main` avec description structurée + screenshots
- Review par le superviseur avant merge
- Pas de force push, pas de bypass hooks
- Worktrees pour le parallélisme inter-agents

## 8. Décomposition en sous-projets aval

Le sous-projet 1 (ce document) débloque la rédaction des specs des sous-projets suivants :

- **Sous-projet 2** — Adaptation mobile-native (gestures, transitions, haptics) sur les pages existantes
- **Sous-projet 3** — Setup build iOS/Android Capacitor (plugins natifs, splash, icons, signing dev free)
- **Sous-projet 4** — Implémentation features mobiles spécifiques (Face ID, Apple Pay, deep linking, offline)
- **Sous-projet 5** — Workflow vivant de supervision (artefacts opérationnels — découle directement des livrables L3+L4)

Chaque sous-projet aura son propre cycle design → plan → exécution.

## 9. Critères de complétion du sous-projet 1

Le sous-projet 1 est terminé quand :

- [ ] L1 (audit) est rédigé et commité sur `main` après validation Tom
- [ ] L2 (roadmap) est rédigée, dimensionne précisément les sous-projets 2-5, validée par Tom
- [ ] L3 (roster) est rédigé avec profils complets, validé
- [ ] L4 (Playwright + simulateur) est en place : `npm run e2e:visual` produit des screenshots des pages clés, `npm run sim:ios` lance le simulateur
- [ ] Build iOS actuel testé et screenshots de l'état initial archivés dans `cyna-app/docs/audits/screenshots/initial/`
- [ ] PR `feat/mobile-audit-setup` mergée sur `main`

## 10. Risques et mitigations

| Risque | Mitigation |
|---|---|
| Build iOS échoue dès le départ (config Capacitor cassée) | Capacitor-Setup intervient en priorité dès le sous-projet 3 ; au pire, on documente l'échec dans l'audit et on fixe avant tout autre travail |
| Le design web mobile a des trucs incompatibles natif (overflow horizontal, fixed positioning cassé sur iOS WebView) | L'audit (L1) identifie ces points ; Page-Adapter les corrige sans changer le rendu visuel attendu |
| Trop d'agents en parallèle → conflits Git | Worktrees + découpage de scope strict + branches dédiées |
| Dérive scope / tentation de refondre le design | Anti-dérive explicite dans chaque profil agent + review systématique du superviseur |
| `cyna-api` ne supporte pas une feature native (ex : refresh token mobile) | L'audit (L1) le détecte ; on tranche avec Tom : ajouter côté API ou couper la feature native |
