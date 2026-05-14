import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorEnvelopeSimple,
  phosphorClipboardText,
  phosphorCalendarBlank,
  phosphorShieldCheck,
  phosphorCertificate,
  phosphorCaretUp,
  phosphorCaretDown,
  phosphorLock,
  phosphorGlobe,
  phosphorWarning,
  phosphorPackage,
  phosphorKey,
  phosphorUser,
  phosphorMapPin,
  phosphorCreditCard,
  phosphorChartLine,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { MobileListSkeletonComponent } from '@shared/components/mobile-list-skeleton/mobile-list-skeleton.component';
import { LocalizedDatePipe } from '@shared/pipes/localized-date.pipe';
import { DashboardPage } from './dashboard.page';
import { DashboardHomePage } from './home/dashboard-home.page';
import { DashboardAccountPage } from './account/dashboard-account.page';
import { DashboardSubscriptionsPage } from './subscriptions/dashboard-subscriptions.page';
import { DashboardOrdersPage } from './orders/dashboard-orders.page';
import { DashboardProductsPage } from './catalog/dashboard-products.page';
import { DashboardServicesPage } from './catalog/dashboard-services.page';
import { DashboardLicensesPage } from './catalog/dashboard-licenses.page';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';
import { AccountTabComponent } from './account/components/account-tab/account-tab.component';
import { PreferencesTabComponent } from './account/components/preferences-tab/preferences-tab.component';
import { SecurityTabComponent } from './account/components/security-tab/security-tab.component';
import { AddressesTabComponent } from './account/components/addresses-tab/addresses-tab.component';

/**
 * On native (Capacitor), the dashboard home view is registered as the
 * default child route (`path: ''`) of `DashboardPage`. That way the
 * inner `<ion-router-outlet>` always holds a "from" ion-page when the
 * user taps a tile, and Ionic can run its iOS slide-in transition into
 * the orders / subscriptions / my-licenses pages. On the web the home
 * stays inline inside `DashboardPage.html` (see `@else if (!isNative)`
 * block), so we DON'T add this child route there — otherwise the
 * `hasChildRoute()` flag would flip to true at `/dashboard` and the
 * web home block would never render.
 */
const dashboardHomeChild: Route[] = isNativeCapacitor()
  ? [{ path: '', component: DashboardHomePage, pathMatch: 'full' }]
  : [];

@NgModule({
  declarations: [
    DashboardPage,
    DashboardHomePage,
    DashboardAccountPage,
    DashboardSubscriptionsPage,
    DashboardOrdersPage,
    DashboardProductsPage,
    DashboardServicesPage,
    DashboardLicensesPage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ReactiveFormsModule,
    DashboardTopBarComponent,
    CatalogPageComponent,
    NgIconComponent,
    AccountTabComponent,
    PreferencesTabComponent,
    SecurityTabComponent,
    AddressesTabComponent,
    MobilePageShellComponent,
    MobileStateComponent,
    MobileListSkeletonComponent,
    LocalizedDatePipe,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardPage,
        children: [
          ...dashboardHomeChild,
          {
            path: 'orders',
            loadChildren: () =>
              import('./orders/orders.module').then(
                (m) => m.DashboardOrdersModule,
              ),
          },
          {
            path: 'subscriptions',
            loadChildren: () =>
              import('./subscriptions/subscriptions.module').then(
                (m) => m.DashboardSubscriptionsModule,
              ),
          },
          {
            path: 'my-licenses',
            loadChildren: () =>
              import('./licenses/licenses.module').then(
                (m) => m.DashboardLicensesModule,
              ),
          },
        ],
      },
      { path: 'account', component: DashboardAccountPage },
      {
        path: 'account/delete',
        loadComponent: () =>
          import('./account/pages/account-delete.page').then(
            (m) => m.AccountDeletePage,
          ),
      },
      {
        path: 'account/addresses/new',
        loadComponent: () =>
          import('./account/pages/address-form.page').then(
            (m) => m.AddressFormPage,
          ),
      },
      {
        path: 'account/addresses/edit/:id',
        loadComponent: () =>
          import('./account/pages/address-form.page').then(
            (m) => m.AddressFormPage,
          ),
      },
      { path: 'account/:tab', component: DashboardAccountPage },
      { path: 'subscriptions', component: DashboardSubscriptionsPage },
      { path: 'orders', component: DashboardOrdersPage },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/order-detail/order-detail.page').then(
            (m) => m.OrderDetailPage,
          ),
      },
      { path: 'products', component: DashboardProductsPage },
      {
        path: 'products/:slug',
        loadChildren: () =>
          import('../product-detail/product-detail.module').then(
            (m) => m.ProductDetailPageModule,
          ),
      },
      { path: 'services', component: DashboardServicesPage },
      {
        path: 'services/:slug',
        loadChildren: () =>
          import('../product-detail/product-detail.module').then(
            (m) => m.ProductDetailPageModule,
          ),
      },
      { path: 'licenses', component: DashboardLicensesPage },
      {
        path: 'licenses/:slug',
        loadChildren: () =>
          import('../product-detail/product-detail.module').then(
            (m) => m.ProductDetailPageModule,
          ),
      },
      {
        path: 'cart',
        loadChildren: () =>
          import('../cart/cart.module').then((m) => m.CartPageModule),
      },
      {
        path: 'checkout',
        loadChildren: () =>
          import('../checkout/checkout.module').then(
            (m) => m.CheckoutPageModule,
          ),
      },
      {
        path: 'order/confirmation/:id',
        loadChildren: () =>
          import('../order-confirmation/order-confirmation.module').then(
            (m) => m.OrderConfirmationPageModule,
          ),
      },
      {
        path: 'subscription/confirmation/:id',
        loadChildren: () =>
          import('../subscription-confirmation/subscription-confirmation.module').then(
            (m) => m.SubscriptionConfirmationPageModule,
          ),
      },
      {
        path: 'subscribe/:productSlug',
        loadChildren: () =>
          import('../subscribe/subscribe.module').then(
            (m) => m.SubscribePageModule,
          ),
      },
    ]),
  ],
  providers: [
    provideIcons({
      phosphorPackage,
      phosphorShieldCheck,
      phosphorCertificate,
      phosphorUser,
      phosphorCaretUp,
      phosphorCaretDown,
      phosphorLock,
      phosphorGlobe,
      phosphorWarning,
      phosphorEnvelopeSimple,
      phosphorClipboardText,
      phosphorCalendarBlank,
      phosphorKey,
      phosphorMapPin,
      phosphorCreditCard,
      phosphorChartLine,
    }),
  ],
})
export class DashboardPageModule {}
