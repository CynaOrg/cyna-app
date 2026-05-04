import { Routes } from '@angular/router';

/**
 * Sub-routes for the native legal pages, mounted under `/m/legal/*` by
 * `NATIVE_ROUTES`. Each page is a standalone component lazy-loaded on
 * navigation so the static legal bundle is never paid for upfront.
 */
export const LEGAL_NATIVE_ROUTES: Routes = [
  {
    path: 'cgu',
    loadComponent: () =>
      import('./cgu-native.page').then((m) => m.CguNativePage),
  },
  {
    path: 'mentions',
    loadComponent: () =>
      import('./mentions-native.page').then((m) => m.MentionsNativePage),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./privacy-native.page').then((m) => m.PrivacyNativePage),
  },
  { path: '', redirectTo: 'cgu', pathMatch: 'full' },
];
