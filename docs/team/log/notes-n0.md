# N0 — Native architecture setup — Notes

## Branch / worktree state

- Worktree branch `feat/native-n0-setup` was created from a base of `main` that
  predates B6/B7/B8 (it currently tracks the older `f21c091` commit). As a
  result the branch does **not** contain the iOS app shell that lives on the
  current `origin/main` (added by B6/B7/B8: `ios/App/App/...`,
  `Assets.xcassets/Splash.imageset/...`, etc.).
- Consequence: the items in the spec that target `ios/**` (Info.plist
  `CFBundleDisplayName`, `NSFaceIDUsageDescription`, `CFBundleURLTypes` for the
  `cyna` scheme, `UISupportedInterfaceOrientations` portrait restriction, and
  the `@capacitor/assets` icon/splash generation) cannot be performed in this
  worktree because there is no native iOS project to modify.

### Out-of-scope items deferred for the supervisor

1. **Rebase before iOS edits** — N0 should ideally be rebased onto the current
   `origin/main` (which contains the `ios/` directory) before the Info.plist
   edits land. Doing so here would conflict with the "branch starts from a
   clean main without any native additions" instruction in the brief, so we
   stop and flag.
2. **Capacitor assets generation** — `npx capacitor-assets generate --ios`
   requires `ios/App/App/Assets.xcassets`. Source SVG `src/assets/icon/icon.svg`
   exists and is ready; the command will succeed once iOS is present.
3. **`/m/home` redirect on native boot** — Not implemented. The current root
   redirect `path: ''` still routes natives to `splash` → `home`. N1 should
   replace that redirect target with `/m/home` once the home native page
   exists. Doing it now would 404 because no native page is registered yet.

## Decisions

- **Plugin access via Angular injection tokens** (`plugins.tokens.ts`).
  Capacitor `registerPlugin()` returns an ES `Proxy` whose method getters
  recreate wrappers on every access. This makes `spyOn(Plugin, 'method')` a
  no-op (the spy lands on the proxy target, never observed by the proxy
  `get` trap). Routing every plugin access through DI lets tests provide
  ordinary mock objects, restoring testability without affecting production
  behaviour.
- **No global `IonicModule.forRoot({ mode: 'ios' })` override.** The previous
  rollback was caused by a global iOS mode forced on all Ionic components,
  which leaked into the web build. N0 ships only the shell and the routes —
  per-component iOS styling lands in N1 alongside the first native pages.
- **`/m` route lazy-loaded.** `app-routing.module.ts` adds a single new route
  `path: 'm', loadChildren: …`. The native code is therefore physically
  absent from the web initial chunks unless the user actively navigates to
  `/m`. Verified with `npm run build` (no new chunks added to the web entry).
- **`isNative` redirect not added to `app.component.ts`.** Touching the
  component would risk leaking into the web. Since the native shell currently
  has no children, redirecting natives to `/m` would 404. N1 owns this.

## Files added under `src/app/native/`

```
shell/native-shell.component.ts        + .spec.ts
services/native-platform.service.ts    + .spec.ts
services/haptic.service.ts             + .spec.ts
services/status-bar.service.ts         + .spec.ts
services/share.service.ts              + .spec.ts
services/network.service.ts            + .spec.ts
services/biometric.service.ts          + .spec.ts
services/deep-link.service.ts          + .spec.ts
services/app-lifecycle.service.ts      + .spec.ts
services/plugins.tokens.ts
native.routes.ts
native-routes.module.ts
index.ts
pages/.gitkeep
components/.gitkeep
directives/.gitkeep
```

## Files modified outside `src/app/native/`

- `src/app/app-routing.module.ts` — single new route `m` lazy-loading
  `NativeRoutesModule`. Justification: required entry point for the isolated
  native tree.
- `capacitor.config.ts` — appName `Cyna`, SplashScreen plugin (2 s, brand
  colour `#4f39f6`, no spinner), StatusBar plugin (DEFAULT). Justification:
  config for plugins introduced in N0.
- `package.json` + `package-lock.json` — added `@capacitor/{splash-screen,
  status-bar,haptics,app,browser,share,network}`, `@aparajita/capacitor-
  biometric-auth`, `@capacitor/assets` (dev). Justification: dependencies
  required by the new services.

## Web invariant verification

```
git diff --stat origin/main HEAD -- src/app/pages/ src/app/shared/ \
    src/app/core/ src/global.scss tailwind.css src/main.ts src/index.html
```
Output: empty. No web file is touched.

`npm run build` succeeds; output bundle still emits `landing` / `splash` /
`home` etc. as before, plus a new lazy chunk for `native-routes-module`.

## Test results

- `npm run lint` — All files pass linting.
- `npm run build` — Application bundle generation complete, no errors.
- `npm test -- --watch=false --browsers=ChromeHeadless` — **244/244 SUCCESS**
  (233 pre-existing + 11 new tests for the native services).

## Open follow-ups for downstream lots

- N1: rebase onto current `origin/main`, then enrich `ios/App/App/Info.plist`
  (`CFBundleDisplayName=Cyna`, `NSFaceIDUsageDescription`, `CFBundleURLTypes`
  with `cyna` scheme, iPhone-only portrait orientation), generate icon/splash
  via `npx capacitor-assets generate --ios`.
- N1: switch the native root redirect to `/m/home` once the page exists.
- N1: decide whether to call `StatusBarService.init()`, `NetworkService.init()`,
  `AppLifecycleService.init()`, `DeepLinkService.init()` from a native-only
  APP_INITIALIZER in `NativeRoutesModule` (preferred) rather than from
  `AppComponent`.
