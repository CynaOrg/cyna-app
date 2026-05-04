import { Routes } from '@angular/router';

export const CATALOG_NATIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalog-native.page').then((m) => m.CatalogNativePage),
  },
];
