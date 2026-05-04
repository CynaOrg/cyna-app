# Roadmap Mobile-Native — `cyna-app`

**Date** : 2026-05-04
**Effort cible** : fin de cette semaine (~2026-05-10)
**Filet de sécurité** : démo soutenance 2026-05-20 (16 jours)
**Référence** : `mobile-native-audit.md`

---

## 1. Contraintes recap

- Mode **D hybride** : autonomie technique sur les agents, validation Tom sur visuel + décisions architecturales
- **Bombarder** : plusieurs agents en parallèle dès qu'on peut (worktrees + branches dédiées)
- **Quotidien** : au moins 1 milestone visuel par jour avec screenshots simulateur iOS
- **Backend** : aucune modification cyna-api dans cette mission (sauf si CORS `capacitor://localhost` à ajouter — décision en SP3)
- **Tests unitaires Jest 80% min** sur services touchés par chaque batch (Test-Engineer dispatché après chaque batch fonctionnel)

## 2. Batches

| ID | Nom | Scope | Agent | Dépend de | Jours | Milestone |
|---|---|---|---|---|---|---|
| **B1** | Capacitor native baseline | Splash plugin, status bar, app icon, safe areas, haptics, Info.plist enrichi, plugins de base | Capacitor-Setup | — | 0,5 | 🟢 visuel : splash natif + icon + status bar OK sur sim |
| **B2** | Design system fix | Bascule `#1447E6`, Qurova en titres globaux, correction routes navbar `/catalog`/`/account` | Native-UX | — | 0,5 | 🟢 visuel : screenshots avant/après côte à côte |
| **B3** | Native UX patterns globaux | Skeleton component générique, transitions de page, swipe back, helper haptic, ion-refresher directive | Native-UX | B2 | 0,5 | 🟢 visuel : interactions natives sur products list |
| **B4** | Pages adaptation lot 1 | auth (login + register + forgot), landing/splash mobile-only, products list, services, licenses, product-detail | Page-Adapter #1 | B3 | 1 | 🟢 visuel : 6 pages côte à côte avant/après |
| **B5** | Pages adaptation lot 2 | cart, checkout, subscribe, order-confirmation, contact, legal, dashboard (home + account + orders + subscriptions) | Page-Adapter #2 | B3 | 1 | 🟢 visuel : checkpoint dashboard + checkout |
| **B6** | Auth mobile (Face ID / Touch ID) | Plugin biometric-auth, flow opt-in, fallback mot de passe, stockage refresh token | Auth-Mobile | B4 | 0,5 | 🟢 visuel : démo Face ID sur sim (simulé) |
| **B7** | Payment mobile (Apple Pay) | Activation Apple Pay côté Stripe + bouton dans Payment Element + tests sandbox | Payment-Mobile | B5 | 0,5 | 🟢 visuel : checkout avec bouton Apple Pay |
| **B8** | Cross-cutting natif | Deep linking (`cyna://`), `@capacitor/share` sur produit, mode offline (cache produits + panier persistant + network banner), `@capacitor/browser` pour liens externes legal | Native-UX (round 2) | B4 + B5 | 0,5 | 🟢 visuel : démo share + offline banner |
| **B9** | iOS sideload build | Free signing Xcode, build release, install sur iPhone Tom, doc resign 7 jours | Capacitor-Setup (round 2) | B1 + B6 + B7 + B8 | 0,5 | 🟢 livrable : iPhone Tom avec app installée + screenshot photo |
| **TE1-9** | Tests unitaires | 80% min sur services touchés par chaque batch | Test-Engineer | par batch | 0,25 par batch | 🟡 technique : `npm run test --watch=false` vert |

**Total effort agents** : ~5,5 jours-homme étalés sur ~3 jours réels grâce à la parallélisation.

## 3. Dependency graph

```
        ┌─── B1 (Capacitor baseline) ────────────────┐
        │                                            │
        │                                            ▼
START ──┤                                         B9 (sideload iPhone)
        │                                            ▲
        ├─── B2 (Design fix) ──┐                     │
                                │                     │
                                ▼                     │
                              B3 (UX patterns) ──┐    │
                                                  │   │
                              ┌───────────────────┤   │
                              ▼                   ▼   │
                            B4 (Pages lot 1)   B5 (Pages lot 2)
                              │                   │
                              │                   │
                              ▼                   ▼
                            B6 (Face ID)       B7 (Apple Pay)
                              │                   │
                              └────────┬──────────┘
                                       ▼
                                     B8 (Cross-cutting natif)
                                       │
                                       └──────────────────────┘
```

**Parallélisations possibles** :
- **Phase 1** : B1 et B2 en parallèle dès le début (touchent fichiers disjoints — `ios/`, `capacitor.config.ts`, plugins vs Tailwind theme + navbar)
- **Phase 2** : B4 et B5 en parallèle après B3 (deux Page-Adapter sur des listes de pages disjointes)
- **Phase 3** : B6 et B7 en parallèle (Auth-Mobile sur auth/, Payment-Mobile sur checkout/subscribe)
- **Phase 4** : B8 seul puis B9 final

## 4. Daily schedule (calendrier serré, fin de semaine cible)

| Jour | Date | Batches dispatchés | Validation Tom |
|---|---|---|---|
| **J1** | lun. **2026-05-04** | SP1 (audit) ✅ + démarrage SP2 : **B1 + B2** en parallèle | Validation **L1+L2+L3** ce soir → GO J2 |
| **J2** | mar. 2026-05-05 | Fin B1 + fin B2 → **B3** + démarrage **B4 + B5** en parallèle (dès B3 mergé) | Visuel : screenshots simulateur après B1+B2+B3 |
| **J3** | mer. 2026-05-06 | Fin B4 + B5 → **B6 + B7** en parallèle | Visuel : 6 pages lot 1 + dashboard checkout (Tom valide design avant B6/B7) |
| **J4** | jeu. 2026-05-07 | **B8** → **B9** | Visuel : Face ID + Apple Pay démo |
| **J5** | ven. 2026-05-08 | Buffer / corrections / polish / Test-Engineer final round | Validation finale : sideload iPhone Tom |
| **J6-7** | sam-dim 2026-05-09/10 | Buffer si retard | — |
| **J8-15** | 11→18 mai | Marge confortable jusqu'à soutenance 20/05 | — |

Si on dérape J3 ou J4, on a la semaine suivante en filet sans stress.

## 5. Validation checkpoints (Tom)

À chaque milestone, le superviseur ping Tom avec :
- Screenshot(s) `before/after` (Playwright + simulateur iOS pour les batches visuels)
- Diff résumé (lien GitHub PR ou git diff stat)
- Items à valider explicitement

**Decision points (avant dispatch)** :
- DP1 — choix de l'approche routes navbar : alias dans routing OU correction des `routerLink` ? → ping en J2 avant B2
- DP2 — choix Apple Pay : test mode sandbox uniquement OU mode live ? → ping en J3 avant B7
- DP3 — choix free signing : Apple ID Tom existant OU création account dédié ? → ping en J3 avant B9

**Validation visuelle à chaque jour** :
- Tom valide ou demande des corrections sur le screenshot diff
- Re-dispatch avec feedback précis si nécessaire

## 6. Branch and PR plan

### Convention de nommage
- `feat/mobile-b1-capacitor-baseline`
- `feat/mobile-b2-design-system-fix`
- `feat/mobile-b3-native-ux-patterns`
- `feat/mobile-b4-pages-lot1`
- `feat/mobile-b5-pages-lot2`
- `feat/mobile-b6-auth-biometric`
- `feat/mobile-b7-apple-pay`
- `feat/mobile-b8-cross-cutting-native`
- `feat/mobile-b9-ios-sideload`

### PR flow
1. Chaque agent travaille sur son **worktree dédié** (skill `superpowers:using-git-worktrees`)
2. Commits atomiques avec messages conventionnels
3. PR vers `main` avec description structurée + screenshots Playwright
4. Review **superviseur** (moi) avant validation
5. Validation Tom sur screenshots si batch visuel
6. Merge sur `main` (squash si beaucoup de petits commits, sinon merge commit propre)
7. Worktree nettoyé après merge

### Ordre de merge attendu
B1 → B2 → B3 → (B4 ⏸ B5) → (B6 ⏸ B7) → B8 → B9

⏸ = peut être inversé selon ordre de complétion

## 7. Risk-adjusted fallback

Si on slippe, **scope minimum demo-viable** :

| Priorité | Inclus dans MVP démo | Coupable si retard |
|---|---|---|
| **P0** (must have) | B1, B2, B3, B4 (auth + listes), routes navbar fixées, splash + icon + couleur correcte, sideload iPhone | — |
| **P1** (should have) | B5 (cart + checkout), B7 (Apple Pay), pull-to-refresh, transitions | dashboard, abonnements pause/resume |
| **P2** (nice to have) | B6 (Face ID), B8 (deep link, share, offline) | tout SP4 si on doit |

**Démo viable minimum** = B1 + B2 + B3 + B4 + B5 partiel (cart + checkout) + B9 sideload = ~4 jours-homme, faisable en 2 jours réels avec parallélisation.

## 8. Critères de succès du sous-projet 1 (SP1)

Cochés au moment de la rédaction :

- [x] L1 (audit) rédigé et commité (`mobile-native-audit.md`)
- [x] L2 (roadmap, ce document) rédigée
- [ ] L3 (roster) rédigé — Task 12
- [x] L4 (Playwright + sim:ios) en place : `npm run e2e:visual` produit des screenshots, `npm run sim:ios` lance le simulateur
- [x] Build iOS actuel testé et screenshots état initial archivés (`screenshots/initial/`)
- [ ] PR `feat/mobile-audit-setup` mergée sur `main` — Task 13
