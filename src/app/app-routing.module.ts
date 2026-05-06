import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import {
  nativeOnlyGuard,
  browserOnlyGuard,
} from '@core/guards/platform-redirect.guard';
import { authGuard } from '@core/guards/auth.guard';

const isNative = isNativeCapacitor();

const routes: Routes = [
  {
    path: 'splash',
    loadChildren: () =>
      import('./pages/splash/splash.module').then((m) => m.SplashPageModule),
  },
  {
    path: 'landing',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingPageModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule,
      ),
  },
  {
    path: 'home',
    canActivate: [nativeOnlyGuard],
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'catalog',
    canActivate: [nativeOnlyGuard],
    loadComponent: () =>
      import('./pages/catalog/catalog.page').then((m) => m.CatalogPage),
  },
  {
    path: 'account',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/account.page').then((m) => m.AccountPage),
  },
  {
    path: 'account/profile',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/profile/account-profile.page').then(
        (m) => m.AccountProfilePage,
      ),
  },
  {
    path: 'account/security',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/security/account-security.page').then(
        (m) => m.AccountSecurityPage,
      ),
  },
  {
    path: 'account/preferences',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/preferences/account-preferences.page').then(
        (m) => m.AccountPreferencesPage,
      ),
  },
  {
    path: 'account/billing',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/billing/account-billing.page').then(
        (m) => m.AccountBillingPage,
      ),
  },
  {
    path: 'account/addresses',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/account/addresses/account-addresses.page').then(
        (m) => m.AccountAddressesPage,
      ),
  },
  {
    path: 'account/addresses/new',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/dashboard/account/pages/address-form.page').then(
        (m) => m.AddressFormPage,
      ),
  },
  {
    path: 'account/addresses/edit/:id',
    canActivate: [nativeOnlyGuard, authGuard],
    loadComponent: () =>
      import('./pages/dashboard/account/pages/address-form.page').then(
        (m) => m.AddressFormPage,
      ),
  },
  {
    path: 'products',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/products/products.module').then(
        (m) => m.ProductsPageModule,
      ),
    pathMatch: 'full',
  },
  {
    path: 'services',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/services/services.module').then(
        (m) => m.ServicesPageModule,
      ),
    pathMatch: 'full',
  },
  {
    path: 'licenses',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/licenses/licenses.module').then(
        (m) => m.LicensesPageModule,
      ),
    pathMatch: 'full',
  },
  {
    path: 'products/:slug',
    loadChildren: () =>
      import('./pages/product-detail/product-detail.module').then(
        (m) => m.ProductDetailPageModule,
      ),
  },
  {
    path: 'services/:slug',
    loadChildren: () =>
      import('./pages/product-detail/product-detail.module').then(
        (m) => m.ProductDetailPageModule,
      ),
  },
  {
    path: 'licenses/:slug',
    loadChildren: () =>
      import('./pages/product-detail/product-detail.module').then(
        (m) => m.ProductDetailPageModule,
      ),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./pages/cart/cart.module').then((m) => m.CartPageModule),
  },
  {
    path: 'subscribe/:productSlug',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/subscribe/subscribe.module').then(
        (m) => m.SubscribePageModule,
      ),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./pages/checkout/checkout.module').then(
        (m) => m.CheckoutPageModule,
      ),
  },
  {
    path: 'order/confirmation/:id',
    loadChildren: () =>
      import('./pages/order-confirmation/order-confirmation.module').then(
        (m) => m.OrderConfirmationPageModule,
      ),
  },
  {
    path: 'contact',
    loadChildren: () =>
      import('./pages/contact/contact.module').then((m) => m.ContactPageModule),
  },
  {
    path: 'legal',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/legal/legal.module').then((m) => m.LegalModule),
  },
  {
    path: '',
    redirectTo: isNative ? 'splash' : 'landing',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: isNative ? 'home' : 'landing',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
