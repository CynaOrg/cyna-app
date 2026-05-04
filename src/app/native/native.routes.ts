import { Routes } from '@angular/router';

/**
 * Native-only routes mounted under `/m`.
 *
 * The shell renders a `<router-outlet />` and pages are lazy-loaded as
 * standalone components in N1..N6. Keeping the children array empty here
 * lets the web build finish without pulling unfinished native pages.
 */
export const NATIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/native-shell.component').then(
        (m) => m.NativeShellComponent,
      ),
    children: [
      // Native pages are added in subsequent N1..N6 lots, e.g.:
      // { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: 'home', loadComponent: () =>
      //     import('./pages/home/home-native.page').then(m => m.HomeNativePage) },
    ],
  },
];
