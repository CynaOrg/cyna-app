# Mobile-Native Audit & Setup Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the 4 deliverables of sub-project 1 (audit report, roadmap, agent roster, visual monitoring setup) so sub-projects 2-5 can be designed and dispatched.

**Architecture:** Sequential audit phase (Tasks 1-7) followed by deliverable production phase (Tasks 8-11) and a closing PR (Task 12). The audit is performed by the supervisor (current session) — no sub-agent dispatch in this plan; sub-agents are introduced in sub-projects 2-5 once the roster (L3) exists.

**Tech Stack:** Angular 20, Ionic 8, Capacitor 8, TypeScript, Playwright (to add), Xcode 15+ iOS Simulator.

**Spec reference:** `cyna-app/docs/superpowers/specs/2026-05-04-mobile-native-audit-design.md`

---

## File Structure

Files created or modified across this plan:

| Path | Purpose |
|---|---|
| `cyna-app/docs/audits/mobile-native-audit.md` | L1 — full audit report |
| `cyna-app/docs/audits/roadmap.md` | L2 — 3-week roadmap with daily milestones |
| `cyna-app/docs/audits/screenshots/initial/*.png` | Initial state screenshots (iOS sim) |
| `cyna-app/docs/audits/screenshots/playwright/*.png` | Playwright web mobile-viewport screenshots |
| `cyna-app/docs/team/agent-roster.md` | L3 — 6 specialized agent profiles |
| `cyna-app/docs/team/log/.gitkeep` | Bootstrap daily log directory |
| `cyna-app/e2e/visual/playwright.config.ts` | Playwright config for mobile viewports |
| `cyna-app/e2e/visual/helpers/screenshot.ts` | Reusable `screenshotPage(route, name)` helper |
| `cyna-app/e2e/visual/specs/initial-snapshot.spec.ts` | First Playwright spec capturing key pages |
| `cyna-app/scripts/sim-ios.sh` | Bash script to build + launch iOS simulator |
| `cyna-app/package.json` | Add scripts `e2e:visual`, `sim:ios` and dev dep `@playwright/test` |

---

## Task 1: Create branch `feat/mobile-audit-setup`

**Files:**
- N/A (Git operation)

- [ ] **Step 1: Verify clean working state**

Run: `git status --short`
Expected: Two existing modifications (`login.page.ts`, `register.page.ts`) — these are user's WIP, leave them alone. No other changes.

- [ ] **Step 2: Stash user WIP to avoid mixing into our branch**

Run: `git stash push -m "user-wip-auth-pages" -- src/app/pages/auth/login/login.page.ts src/app/pages/auth/register/register.page.ts`
Expected: `Saved working directory and index state On main: user-wip-auth-pages`

- [ ] **Step 3: Create and switch to branch**

Run: `git checkout -b feat/mobile-audit-setup`
Expected: `Switched to a new branch 'feat/mobile-audit-setup'`

- [ ] **Step 4: Verify branch state**

Run: `git status` and `git log --oneline -3`
Expected: Clean tree on `feat/mobile-audit-setup`, last commit is the spec doc.

---

## Task 2: Read the cadrage and capture functional scope notes

**Files:**
- Read: `/Users/tom/Documents/projetsCours/Cyna/cyna-workspace/cadrage.pdf`
- Create: `cyna-app/docs/audits/cadrage-notes.md` (working notes, will be folded into L1 later)

- [ ] **Step 1: Read cadrage.pdf in full**

Use Read tool with `pages` parameter if PDF is large. Capture: required mobile features, academic constraints, deadlines, evaluation criteria, mandatory functional scope per project component.

- [ ] **Step 2: Write working notes**

Create `cyna-app/docs/audits/cadrage-notes.md` with sections:
- Functional scope mandated for mobile (what must absolutely work)
- Constraints (academic deadlines, jury demo expectations)
- Implicit native expectations (anything that hints at "real app" vs "PWA")
- Open questions to confirm with Tom

- [ ] **Step 3: Commit working notes**

```bash
git add cyna-app/docs/audits/cadrage-notes.md
git commit -m "docs(audit): capture cadrage.pdf functional scope notes"
```

---

## Task 3: Static inventory of `cyna-app` source

**Files:**
- Read: `cyna-app/src/app/**`
- Create: `cyna-app/docs/audits/static-inventory.md` (working notes)

- [ ] **Step 1: Inventory pages**

For each folder in `cyna-app/src/app/pages/`, read the main `*.page.ts` file. Capture: route, what it does, what API calls it makes, what UI patterns it uses (lists, forms, modals).

Pages to cover: `auth`, `cart`, `checkout`, `contact`, `dashboard`, `landing`, `legal`, `licenses`, `order-confirmation`, `product-detail`, `products`, `services`, `splash`, `subscribe`.

- [ ] **Step 2: Inventory core layer**

Read structure of `cyna-app/src/app/core/`:
- `api/` — Note presence of `schema.ts` (OpenAPI generated)
- `services/` — list each service and its responsibility
- `stores/` — state management approach
- `interceptors/` — HTTP interceptors (auth, error)
- `guards/` — route guards
- `interfaces/`, `utils/`, `mocks/` — quick scan

- [ ] **Step 3: Inventory shared and features**

- `cyna-app/src/app/shared/components/` — list reusable components, note which are mobile-aware
- `cyna-app/src/app/features/` — note that this folder appears mostly empty (only `index.ts`)

- [ ] **Step 4: Inventory routing**

Read `cyna-app/src/app/app-routing.module.ts` and any feature routing modules. List all routes and their lazy-load status.

- [ ] **Step 5: Write static inventory document**

Create `cyna-app/docs/audits/static-inventory.md` with the inventory above, structured clearly. This will be folded into L1.

- [ ] **Step 6: Commit**

```bash
git add cyna-app/docs/audits/static-inventory.md
git commit -m "docs(audit): static inventory of cyna-app source structure"
```

---

## Task 4: Inventory dependencies and Capacitor plugins

**Files:**
- Read: `cyna-app/package.json`
- Read: `cyna-app/capacitor.config.ts`
- Read: `cyna-app/ios/App/App/Info.plist` (if exists)
- Create: `cyna-app/docs/audits/deps-inventory.md` (working notes)

- [ ] **Step 1: Categorize current dependencies**

Read `package.json` and group dependencies into:
- Angular 20 ecosystem
- Ionic 8 ecosystem
- Capacitor 8 core + plugins (currently: `@capacitor/android`, `@capacitor/ios`, `@capacitor/preferences`)
- Tooling (eslint, tailwind, etc.)
- Patches (note presence of `patch-package` postinstall)

- [ ] **Step 2: List required plugins per native feature**

For each native feature in spec section 3.1, list the npm package and confirm it's NOT already installed. Expected missing list:

| Feature | Package |
|---|---|
| Splash screen | `@capacitor/splash-screen` |
| Status bar | `@capacitor/status-bar` |
| App icon (assets resources) | `@capacitor/assets` (dev tool) |
| Haptics | `@capacitor/haptics` |
| Biometric (Face ID/Touch ID) | `@capacitor-community/biometric-auth` |
| App / deep linking | `@capacitor/app` |
| Browser (in-app fallback) | `@capacitor/browser` |
| Share | `@capacitor/share` |
| Network detection (offline) | `@capacitor/network` |

- [ ] **Step 3: Inspect iOS native config**

Read `cyna-app/ios/App/App/Info.plist` if it exists. Note presence/absence of: `NSFaceIDUsageDescription`, `LSApplicationQueriesSchemes`, splash storyboard reference, URL schemes for deep linking.

- [ ] **Step 4: Write deps inventory**

Create `cyna-app/docs/audits/deps-inventory.md` with current deps, missing plugins to add (per feature), and required Info.plist additions.

- [ ] **Step 5: Commit**

```bash
git add cyna-app/docs/audits/deps-inventory.md
git commit -m "docs(audit): inventory dependencies and missing Capacitor plugins"
```

---

## Task 5: Build current state on iOS Simulator and capture initial screenshots

**Files:**
- Run: build commands
- Create: `cyna-app/docs/audits/screenshots/initial/*.png`

- [ ] **Step 1: Verify Xcode and CocoaPods are available**

Run: `xcode-select -p && pod --version`
Expected: Path to Xcode CommandLineTools and a CocoaPods version. If pod missing, abort and ping Tom (we don't auto-install dev tooling).

- [ ] **Step 2: Build the Angular app**

Run from `cyna-app/`: `npm run build`
Expected: Successful build into `www/browser/`. If failure, log the error to `cyna-app/docs/audits/build-errors.md`, commit, and stop here — Tom must triage before we proceed.

- [ ] **Step 3: Sync Capacitor**

Run from `cyna-app/`: `npx cap sync ios`
Expected: Success. iOS project updated. If errors, log and stop.

- [ ] **Step 4: Start iOS simulator and run the app**

Run: `npx cap run ios --target "iPhone 15"` (or fall back to `npx cap open ios` and run from Xcode if CLI run fails). Wait for simulator boot and app launch.

- [ ] **Step 5: Capture initial screenshots**

Create directory: `mkdir -p cyna-app/docs/audits/screenshots/initial`

For each of the following screens, navigate the app on the simulator and capture with `xcrun simctl io booted screenshot cyna-app/docs/audits/screenshots/initial/<page>.png`:

- `splash.png` (the splash if visible)
- `landing.png`
- `auth-login.png`
- `auth-register.png`
- `products-list.png`
- `product-detail.png`
- `cart.png`
- `checkout.png`
- `dashboard-licenses.png`
- `dashboard-account.png`
- `services.png`
- `contact.png`
- `legal.png`

If a screen errors or is unreachable, capture the error state and rename the file `ERROR-<page>.png`.

- [ ] **Step 6: Commit screenshots**

```bash
git add cyna-app/docs/audits/screenshots/initial/
git commit -m "docs(audit): capture initial iOS simulator screenshots of cyna-app"
```

---

## Task 6: Audit `cyna-api` for mobile-relevant endpoints

**Files:**
- Read: `cyna-workspace/cyna-api/openapi.json` and relevant controllers
- Create: `cyna-app/docs/audits/api-mobile-audit.md` (working notes)

- [ ] **Step 1: Locate the OpenAPI schema**

Run: `ls /Users/tom/Documents/projetsCours/Cyna/cyna-workspace/cyna-api/openapi.json`
Expected: file exists. If not, fall back to scanning `cyna-api/src/modules/*/controllers`.

- [ ] **Step 2: Identify auth endpoints relevant to mobile**

Look for: login, refresh-token, logout, biometric-related endpoints. Note request/response shapes — particularly whether refresh tokens are mobile-friendly (cookie-based vs body-based).

- [ ] **Step 3: Identify Stripe / payment endpoints**

Look for: payment-intent creation, Apple Pay specifics. Confirm whether the existing `payment-intent` endpoint accepts the parameters needed for Apple Pay (currency, amount, customer email — from recent commits we saw `email` is now sent).

- [ ] **Step 4: Identify deep-link and shareable resource endpoints**

Look for: anything returning a shareable URL or token (product detail public URL, order tracking link).

- [ ] **Step 5: Write mobile API audit**

Create `cyna-app/docs/audits/api-mobile-audit.md` listing:
- Endpoints OK for mobile as-is
- Endpoints needing modification (with exact change required)
- Missing endpoints (with proposed signature)
- Tom decision points (where backend modification cost vs. cutting the feature)

- [ ] **Step 6: Commit**

```bash
git add cyna-app/docs/audits/api-mobile-audit.md
git commit -m "docs(audit): audit cyna-api endpoints for mobile usage"
```

---

## Task 7: Install Playwright and configure mobile viewports

**Files:**
- Modify: `cyna-app/package.json` (add devDep + scripts)
- Create: `cyna-app/e2e/visual/playwright.config.ts`
- Create: `cyna-app/e2e/visual/.gitignore`

- [ ] **Step 1: Install Playwright as devDep**

Run from `cyna-app/`: `npm install --save-dev @playwright/test`
Expected: Package added to devDependencies.

- [ ] **Step 2: Install browser binaries (Chromium only)**

Run: `npx playwright install chromium`
Expected: Chromium downloaded.

- [ ] **Step 3: Create Playwright config**

Create `cyna-app/e2e/visual/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  outputDir: '../../docs/audits/screenshots/playwright',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'iphone-15',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
```

- [ ] **Step 4: Add .gitignore for Playwright artifacts**

Create `cyna-app/e2e/visual/.gitignore`:

```
test-results/
playwright-report/
.playwright/
```

- [ ] **Step 5: Add npm scripts**

Modify `cyna-app/package.json` scripts block to add:

```json
"e2e:visual": "playwright test --config=e2e/visual/playwright.config.ts",
"e2e:visual:ui": "playwright test --config=e2e/visual/playwright.config.ts --ui"
```

- [ ] **Step 6: Verify Playwright setup**

Run from `cyna-app/`: `npx playwright --version`
Expected: Version printed without error.

- [ ] **Step 7: Commit**

```bash
git add cyna-app/package.json cyna-app/package-lock.json cyna-app/e2e/visual/playwright.config.ts cyna-app/e2e/visual/.gitignore
git commit -m "chore(e2e): set up Playwright with mobile viewport projects"
```

---

## Task 8: Write the screenshot helper and first visual spec

**Files:**
- Create: `cyna-app/e2e/visual/helpers/screenshot.ts`
- Create: `cyna-app/e2e/visual/specs/initial-snapshot.spec.ts`

- [ ] **Step 1: Write the helper**

Create `cyna-app/e2e/visual/helpers/screenshot.ts`:

```typescript
import { Page, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const SCREENSHOT_ROOT = '../../docs/audits/screenshots/playwright';

export interface ScreenshotOptions {
  fullPage?: boolean;
  waitForSelector?: string;
  waitMs?: number;
}

export async function screenshotPage(
  page: Page,
  route: string,
  name: string,
  opts: ScreenshotOptions = {},
): Promise<string> {
  await page.goto(route, { waitUntil: 'networkidle' });
  if (opts.waitForSelector) {
    await page.waitForSelector(opts.waitForSelector, { timeout: 5000 });
  }
  if (opts.waitMs) {
    await page.waitForTimeout(opts.waitMs);
  }
  const projectName = page.context().browser()?.browserType().name() ?? 'unknown';
  const viewport = page.viewportSize();
  const tag = viewport ? `${viewport.width}x${viewport.height}` : projectName;
  const filename = `${name}-${tag}.png`;
  const fullPath = join(__dirname, '..', SCREENSHOT_ROOT, filename);
  await mkdir(dirname(fullPath), { recursive: true });
  await page.screenshot({ path: fullPath, fullPage: opts.fullPage ?? true });
  return fullPath;
}
```

- [ ] **Step 2: Write the failing initial-snapshot spec**

Create `cyna-app/e2e/visual/specs/initial-snapshot.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { screenshotPage } from '../helpers/screenshot';

const PUBLIC_PAGES: ReadonlyArray<{ route: string; name: string }> = [
  { route: '/landing', name: 'landing' },
  { route: '/auth/login', name: 'auth-login' },
  { route: '/auth/register', name: 'auth-register' },
  { route: '/products', name: 'products-list' },
  { route: '/services', name: 'services' },
  { route: '/contact', name: 'contact' },
  { route: '/legal', name: 'legal' },
];

for (const { route, name } of PUBLIC_PAGES) {
  test(`captures ${name} (${route})`, async ({ page }) => {
    await screenshotPage(page, route, name);
  });
}
```

- [ ] **Step 3: Start the Angular dev server**

In a separate terminal: from `cyna-app/`, run `npm start` (which runs `node server.js`) OR `npx ng serve --host 0.0.0.0 --port 4200`. Wait until "Compiled successfully". Set `PLAYWRIGHT_BASE_URL` accordingly if not 4200.

- [ ] **Step 4: Run the spec to verify it produces screenshots**

Run from `cyna-app/`: `npm run e2e:visual -- --project=iphone-15`
Expected: 7 tests pass, 7 PNG files appear in `cyna-app/docs/audits/screenshots/playwright/`.

If routes 404, that means the route names are wrong — read the actual `app-routing.module.ts` and update the `PUBLIC_PAGES` array. Re-run.

- [ ] **Step 5: Commit Playwright screenshots**

```bash
git add cyna-app/e2e/visual/helpers/screenshot.ts cyna-app/e2e/visual/specs/initial-snapshot.spec.ts cyna-app/docs/audits/screenshots/playwright/
git commit -m "test(e2e): add Playwright initial snapshot spec for public pages"
```

---

## Task 9: Write the `sim:ios` script

**Files:**
- Create: `cyna-app/scripts/sim-ios.sh`
- Modify: `cyna-app/package.json` (add `sim:ios` script)

- [ ] **Step 1: Write the bash script**

Create `cyna-app/scripts/sim-ios.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

DEVICE="${SIM_DEVICE:-iPhone 15}"

echo "[sim:ios] Building Angular app..."
npm run build

echo "[sim:ios] Syncing Capacitor iOS..."
npx cap sync ios

echo "[sim:ios] Booting simulator '$DEVICE' (if not already booted)..."
xcrun simctl boot "$DEVICE" 2>/dev/null || true
open -a Simulator

echo "[sim:ios] Running on iOS simulator..."
npx cap run ios --target "$DEVICE"
```

- [ ] **Step 2: Make the script executable**

Run: `chmod +x cyna-app/scripts/sim-ios.sh`

- [ ] **Step 3: Add npm script**

Modify `cyna-app/package.json` scripts to add:

```json
"sim:ios": "bash scripts/sim-ios.sh"
```

- [ ] **Step 4: Verify the script syntax (without running the full build)**

Run: `bash -n cyna-app/scripts/sim-ios.sh`
Expected: No output (syntax OK).

- [ ] **Step 5: Commit**

```bash
git add cyna-app/scripts/sim-ios.sh cyna-app/package.json
git commit -m "chore(scripts): add sim:ios script to build, sync and run iOS simulator"
```

---

## Task 10: Write L1 — the audit report

**Files:**
- Create: `cyna-app/docs/audits/mobile-native-audit.md`
- Read (folding in): `cadrage-notes.md`, `static-inventory.md`, `deps-inventory.md`, `api-mobile-audit.md`, screenshots

- [ ] **Step 1: Structure the audit report**

Create `cyna-app/docs/audits/mobile-native-audit.md` with sections:

1. Executive summary (5-10 lines: where we are, where we go, biggest blockers)
2. Functional scope from cadrage (folded from `cadrage-notes.md`)
3. Code inventory (folded from `static-inventory.md`)
4. Dependencies and missing plugins (folded from `deps-inventory.md`)
5. Initial state — iOS simulator (reference screenshots in `screenshots/initial/`, comment each)
6. Initial state — Playwright web mobile viewport (reference screenshots in `screenshots/playwright/`, comment differences with iOS)
7. Backend mobile readiness (folded from `api-mobile-audit.md`)
8. Page-by-page gap analysis — for each page in scope, list what's missing for native feel (gestures, transitions, safe area, skeletons, haptics, native UI patterns)
9. Cross-cutting gaps — anything global (navigation transitions, theme, status bar, auth flow on mobile)
10. Backend modifications required — explicit list with rationale
11. Recommended sub-projects 2-5 (high-level scope)
12. Risks observed (concrete, not speculative)

- [ ] **Step 2: Write content for each section**

Use the working notes files. For section 8 (page-by-page), produce a table:

| Page | Has gestures? | Has skeletons? | Safe area OK? | Native plugin needed? | Priority (P0/P1/P2) |
|---|---|---|---|---|---|

- [ ] **Step 3: Delete the working notes files (folded in)**

Run:
```bash
git rm cyna-app/docs/audits/cadrage-notes.md cyna-app/docs/audits/static-inventory.md cyna-app/docs/audits/deps-inventory.md cyna-app/docs/audits/api-mobile-audit.md
```

- [ ] **Step 4: Commit the audit**

```bash
git add cyna-app/docs/audits/mobile-native-audit.md
git commit -m "docs(audit): write L1 mobile-native audit report"
```

---

## Task 11: Write L2 — the roadmap

**Files:**
- Create: `cyna-app/docs/audits/roadmap.md`

- [ ] **Step 1: Define batches**

Based on the audit (Task 10), define 5-8 batches that cover sub-projects 2-5 plus the iOS sideload build. Each batch has: ID, name, scope (precise list of pages/files), agent profile assigned, dependencies (which batches must precede), estimated duration in days, validation type (visual milestone vs technical merge).

Suggested initial batch list (adjust based on audit findings):

- B1 — Capacitor native baseline (splash, status bar, safe areas, app icon, haptics, status-bar plugin, basic Info.plist) — Capacitor-Setup
- B2 — Native UX patterns (swipe back globally, page transitions, pull-to-refresh directive, skeleton component) — Native-UX
- B3 — Pages adaptation batch 1 (auth, landing, splash, products list, product detail) — Page-Adapter #1
- B4 — Pages adaptation batch 2 (cart, checkout, dashboard, licenses, services, contact, legal) — Page-Adapter #2
- B5 — Auth mobile (Face ID/Touch ID, mobile-friendly token storage) — Auth-Mobile
- B6 — Payment mobile (Apple Pay via Stripe, native checkout flow) — Payment-Mobile
- B7 — Cross-cutting (deep linking, share, offline cache, network detection) — Native-UX (round 2)
- B8 — iOS sideload build (signing config, provisioning profile dev free, install on Tom's iPhone) — Capacitor-Setup (round 2)

Tests batches are interleaved (Test-Engineer runs after each functional batch on touched services).

- [ ] **Step 2: Write the roadmap document**

Create `cyna-app/docs/audits/roadmap.md` with sections:

1. Constraints recap (3-week deadline, end-of-week target, mode D supervision)
2. Batch table (8 columns: ID, name, scope, agent, depends-on, days, milestone-type, status)
3. Dependency graph (Mermaid diagram showing which batches can run in parallel vs sequential)
4. Daily schedule (calendar from 2026-05-04 to 2026-05-25 with which batch runs what day, parallelism noted)
5. Validation checkpoints (Tom approval gates with what is shown each time)
6. Branch and PR plan (one branch per batch, naming convention, merge order)
7. Risk-adjusted fallback (if we slip, what's the minimum demo-viable subset)

- [ ] **Step 3: Commit the roadmap**

```bash
git add cyna-app/docs/audits/roadmap.md
git commit -m "docs(audit): write L2 roadmap with batches, dependencies and milestones"
```

---

## Task 12: Write L3 — the agent roster, and bootstrap log directory

**Files:**
- Create: `cyna-app/docs/team/agent-roster.md`
- Create: `cyna-app/docs/team/log/.gitkeep`

- [ ] **Step 1: Write agent roster**

Create `cyna-app/docs/team/agent-roster.md` with one section per agent profile (the 6 from the spec, plus the supervisor section). Each profile must contain:

- **Name** — exact identifier used when dispatching
- **Mission statement** — one sentence
- **Authorized scope** — explicit list of folders/files the agent may modify
- **Forbidden scope** — explicit anti-dérive list ("does NOT touch ...")
- **Required deliverables on completion** — diff + screenshots format + summary structure
- **Required commands before completion** — `npm run lint`, `npm run test -- --watch=false`, `npm run e2e:visual` for affected pages
- **Prompt template** — the actual prompt I will use when dispatching this agent (concrete, ready to copy)

The 6 profiles are:

1. **Capacitor-Setup**
2. **Native-UX**
3. **Page-Adapter** (template; instantiated per batch with specific page list)
4. **Auth-Mobile**
5. **Payment-Mobile**
6. **Test-Engineer**

Plus a **Supervisor** section at the bottom describing my own duties (review, screenshot validation, milestone reporting to Tom, commits/merges, daily log).

- [ ] **Step 2: Bootstrap daily log directory**

Create `cyna-app/docs/team/log/.gitkeep` (empty file).

- [ ] **Step 3: Commit**

```bash
git add cyna-app/docs/team/agent-roster.md cyna-app/docs/team/log/.gitkeep
git commit -m "docs(team): write L3 agent roster with prompt templates and bootstrap log dir"
```

---

## Task 13: Final verification and PR

**Files:**
- N/A (verification + Git operation)

- [ ] **Step 1: Re-run lint and tests to confirm nothing broke**

Run from `cyna-app/`:
- `npm run lint`
- `npm run test -- --watch=false --browsers=ChromeHeadless` (if Karma config supports headless; otherwise document the limitation)
Expected: Both green (we haven't touched any production code yet).

- [ ] **Step 2: Re-run Playwright visual spec to confirm reproducibility**

In one terminal: `npm start`
In another: `npm run e2e:visual -- --project=iphone-15`
Expected: All tests pass.

- [ ] **Step 3: Verify all 4 deliverables exist**

Run:
```bash
ls cyna-app/docs/audits/mobile-native-audit.md
ls cyna-app/docs/audits/roadmap.md
ls cyna-app/docs/team/agent-roster.md
ls cyna-app/e2e/visual/playwright.config.ts
ls cyna-app/scripts/sim-ios.sh
```
Expected: All five files exist.

- [ ] **Step 4: Restore user WIP from stash**

Run: `git stash pop`
Expected: `login.page.ts` and `register.page.ts` restored as unstaged modifications. They must NOT be on our branch's commits.

Run: `git status`
Expected: Only those two files modified, none staged on our branch.

- [ ] **Step 5: Push the branch and open PR**

Run:
```bash
git push -u origin feat/mobile-audit-setup
gh pr create --title "Mobile-native audit & team workflow setup (sub-project 1)" --body "$(cat <<'EOF'
## Summary
- L1 audit report at `cyna-app/docs/audits/mobile-native-audit.md`
- L2 roadmap at `cyna-app/docs/audits/roadmap.md`
- L3 agent roster at `cyna-app/docs/team/agent-roster.md`
- L4 visual monitoring: Playwright config + helpers + first spec, `sim:ios` script

## Test plan
- [ ] Spec doc reviewed and validated by Tom
- [ ] `npm run lint` passes
- [ ] `npm run test -- --watch=false` passes
- [ ] `npm run e2e:visual -- --project=iphone-15` produces screenshots of public pages
- [ ] `npm run sim:ios` boots simulator and runs the app

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Report PR URL to Tom for review**

After the PR URL is returned, ping Tom with the link and the summary of deliverables. Wait for his approval before any merge to `main`.

---

## Self-Review Checklist (post-plan)

Before handing this plan off:

1. **Spec coverage** — Each spec section maps to at least one task:
   - Spec §3 (functional scope) → Task 4 (deps), Task 5 (build), Task 10 (audit)
   - Spec §4 (4 deliverables) → Task 10 (L1), Task 11 (L2), Task 12 (L3), Tasks 7-9 (L4)
   - Spec §5 (audit method) → Tasks 2, 3, 4, 5, 6 in order
   - Spec §6 (roster) → Task 12
   - Spec §7 (workflow) → Task 12 (supervisor section)
   - Spec §9 (completion criteria) → Task 13 (verification)

2. **Placeholder scan** — No "TBD"/"TODO" in tasks. All commands and code blocks are concrete. Routes in Task 8 may need adjustment after reading actual routing module — handled with explicit fallback step.

3. **Type consistency** — Helper signature `screenshotPage(page, route, name, opts)` is consistent across Task 8 definition and (if reused later) consistent name. No conflicts within this plan.

4. **Risks** — Two risks acknowledged:
   - Build failure at Task 5 step 2 (Angular build) — handled with stop-and-ping pattern.
   - Routes mismatch at Task 8 step 4 — handled with explicit fallback to read actual routing module.
