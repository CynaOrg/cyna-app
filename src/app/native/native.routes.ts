import { Routes } from '@angular/router';

/**
 * Native-only routes mounted under `/m`.
 *
 * The shell renders the native chrome (header + bottom nav) around a routed
 * `<router-outlet />`. Children are appended by lots N1..N6.
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
      {
        path: 'auth',
        loadChildren: () =>
          import('./pages/auth/auth-native.routes').then(
            (m) => m.AUTH_NATIVE_ROUTES,
          ),
      },
      // Other native pages (catalog, products, cart, dashboard…) are
      // appended in N3..N6 by the corresponding lot agents.
    ],
  },
];
