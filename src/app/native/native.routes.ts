import { Routes } from '@angular/router';

/**
 * Native-only routes mounted under `/m`.
 *
 * The shell renders the native chrome (header + bottom nav) around a routed
 * `<router-outlet />`. Children land here in N1..N6 — N1 only adds the
 * placeholder home page, the rest are appended in subsequent lots.
 */
export const NATIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/native-shell.component').then(
        (m) => m.NativeShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home-native.page').then((m) => m.HomeNativePage),
      },
      // Other native pages (auth, catalog, products, cart, dashboard…) are
      // appended in N2..N6 by the corresponding lot agents.
    ],
  },
];
