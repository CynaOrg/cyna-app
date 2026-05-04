import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

/**
 * Sub-routes for the native dashboard, mounted under `/m/dashboard/*` by
 * `NATIVE_ROUTES`. All routes are auth-guarded — anonymous users are bounced
 * to `/auth/login` by the shared `authGuard`. Each page is a standalone
 * component lazy-loaded on navigation.
 */
export const DASHBOARD_NATIVE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard-native.page').then((m) => m.DashboardNativePage),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./account/dashboard-account-native.page').then(
        (m) => m.DashboardAccountNativePage,
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./orders/dashboard-orders-native.page').then(
        (m) => m.DashboardOrdersNativePage,
      ),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./orders/dashboard-order-detail-native.page').then(
        (m) => m.DashboardOrderDetailNativePage,
      ),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./subscriptions/dashboard-subscriptions-native.page').then(
        (m) => m.DashboardSubscriptionsNativePage,
      ),
  },
  {
    path: 'licenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./licenses/dashboard-licenses-native.page').then(
        (m) => m.DashboardLicensesNativePage,
      ),
  },
];
