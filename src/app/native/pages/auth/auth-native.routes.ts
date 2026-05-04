import { Routes } from '@angular/router';

/**
 * Sub-routes for the native auth flow, mounted under `/m/auth/*` by
 * `NATIVE_ROUTES`. Each page is a standalone component lazy-loaded on
 * navigation so the auth bundle stays out of the shell entry chunk.
 */
export const AUTH_NATIVE_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login-native.page').then((m) => m.LoginNativePage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register-native.page').then(
        (m) => m.RegisterNativePage,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password-native.page').then(
        (m) => m.ForgotPasswordNativePage,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
