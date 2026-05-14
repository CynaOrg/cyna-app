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
  // Clones of /dashboard/{orders,subscriptions,my-licenses} mounted under
  // /account/* so that the iOS slide transition plays natively on the outer
  // router-outlet (URL extension of /account → forward direction inferred).
  // Cross-tab nav from /account → /dashboard/* does not animate even with
  // NavController.navigateForward because the outer outlet has to swap
  // AccountPage ↔ DashboardPage and DashboardPage on native renders an
  // empty inner outlet at first paint.
  {
    path: 'account/orders',
    canActivate: [nativeOnlyGuard, authGuard],
    loadChildren: () =>
      import('./pages/dashboard/orders/orders.module').then(
        (m) => m.DashboardOrdersModule,
      ),
  },
  {
    path: 'account/subscriptions',
    canActivate: [nativeOnlyGuard, authGuard],
    loadChildren: () =>
      import('./pages/dashboard/subscriptions/subscriptions.module').then(
        (m) => m.DashboardSubscriptionsModule,
      ),
  },
  {
    path: 'account/my-licenses',
    canActivate: [nativeOnlyGuard, authGuard],
    loadChildren: () =>
      import('./pages/dashboard/licenses/licenses.module').then(
        (m) => m.DashboardLicensesModule,
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
    path: 'subscription/confirmation/:id',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/subscription-confirmation/subscription-confirmation.module').then(
        (m) => m.SubscriptionConfirmationPageModule,
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
