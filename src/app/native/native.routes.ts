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
      {
        path: 'catalog',
        loadComponent: () =>
          import('./pages/catalog/catalog-native.page').then(
            (m) => m.CatalogNativePage,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products-native.page').then(
            (m) => m.ProductsNativePage,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/services-native.page').then(
            (m) => m.ServicesNativePage,
          ),
      },
      {
        path: 'licenses',
        loadComponent: () =>
          import('./pages/licenses/licenses-native.page').then(
            (m) => m.LicensesNativePage,
          ),
      },
      {
        path: 'products/:slug',
        loadComponent: () =>
          import('./pages/product-detail/product-detail-native.page').then(
            (m) => m.ProductDetailNativePage,
          ),
      },
      {
        path: 'services/:slug',
        loadComponent: () =>
          import('./pages/product-detail/product-detail-native.page').then(
            (m) => m.ProductDetailNativePage,
          ),
      },
      {
        path: 'licenses/:slug',
        loadComponent: () =>
          import('./pages/product-detail/product-detail-native.page').then(
            (m) => m.ProductDetailNativePage,
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard-native.routes').then(
            (m) => m.DASHBOARD_NATIVE_ROUTES,
          ),
      },
      // cart/checkout (N4) routes are appended by the corresponding lot agent.
    ],
  },
];
