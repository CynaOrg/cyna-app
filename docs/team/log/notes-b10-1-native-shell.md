# B10.1 Native-UX — notes

Track of decisions and out-of-scope observations made while polishing the
mobile native shell (sticky topbar, bottom navbar, dashboard safe-areas).

## Decisions

### Bottom navbar — labels and icons (auth-aware)

- 5 tabs in the logged-in state was the bound the spec gave us. To keep them
  legible at iPhone widths we shortened "Tableau de bord" to **"Espace"** and
  picked **`phosphorGauge`** for the dashboard tab — distinct from
  `phosphorSquaresFour` (Catalogue) so the two cannot be confused at a glance.
- Guest state uses **`phosphorSignIn`** (arrow into a doorway), which reads
  immediately as "Connexion" without needing the label.
- Cart badge anchor is owned by a single `cart: true` flag on the cart item
  rather than route-string sniffing, so a future move from `/cart` to
  e.g. `/dashboard/cart` doesn't silently break the badge.

### Safe-areas — `top` vs `padding-top`

- For `mobile-header` (marketing) and the dashboard-sidebar slide-out drawer
  we use `padding-top: env(safe-area-inset-top)` — those elements have a flat
  background that we *want* to extend behind the status bar.
- For the dashboard-sidebar floating mobile pill (when scrolled) we instead
  shift the wrapper with `top: env(safe-area-inset-top)`. Padding would
  inflate the rounded silhouette; offsetting keeps the pill tight while still
  clearing the status bar.
- All safe-area rules are gated by `@media (max-width: 1023.98px)` so the
  desktop dashboard chrome is unaffected.

## Out-of-scope observations (not fixed in this PR)

- **Universal-link prompt on cold launch.** When the simulator is warm, every
  app launch shows iOS's "Ouvrir dans Cyna ?" confirmation dialog before the
  webview becomes interactive. Screenshots after a fresh `simctl boot` do
  *not* show it, so this seems to be a stale Spotlight/handoff state that
  iOS holds on to between launches. Belongs to B8 (deep links). Logged here
  so we don't lose it.
- **Stale build on hot reload.** `npx cap run ios --no-sync` after a build
  occasionally serves the previous bundle — the first nav-bar screenshot
  showed the auth-aware logic returning the *old* 4-tab list. Re-running
  `npm run build && npx cap sync ios && npx cap run ios` fixed it. Not a
  behaviour change, just a heads-up for the team.
- **Logged-in screenshot.** The simulator does not have any seeded test
  credentials and macOS accessibility refused to grant osascript
  keystroke/click rights, so the 5-tab logged-in variant is exercised by
  unit tests but not by a screenshot. Tom will validate visually at sideload.
