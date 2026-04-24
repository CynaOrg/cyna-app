import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
} from '@ng-icons/phosphor-icons/regular';
import { DashboardPage } from './dashboard.page';
import { DashboardAccountPage } from './account/dashboard-account.page';
import { DashboardSubscriptionsPage } from './subscriptions/dashboard-subscriptions.page';
import { DashboardOrdersPage } from './orders/dashboard-orders.page';
import { DashboardProductsPage } from './catalog/dashboard-products.page';
import { DashboardServicesPage } from './catalog/dashboard-services.page';
import { DashboardLicensesPage } from './catalog/dashboard-licenses.page';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';
import { AccountTabComponent } from './account/components/account-tab/account-tab.component';
import { BillingTabComponent } from './account/components/billing-tab/billing-tab.component';
import { PreferencesTabComponent } from './account/components/preferences-tab/preferences-tab.component';
import { SecurityTabComponent } from './account/components/security-tab/security-tab.component';
import { AddressesTabComponent } from './account/components/addresses-tab/addresses-tab.component';

@NgModule({
  declarations: [
    DashboardPage,
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
    BillingTabComponent,
    PreferencesTabComponent,
    SecurityTabComponent,
    AddressesTabComponent,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardPage,
        children: [
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
    }),
  ],
})
export class DashboardPageModule {}
