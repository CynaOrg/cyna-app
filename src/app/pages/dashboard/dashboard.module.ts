import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorPackage,
  phosphorShieldCheck,
  phosphorCertificate,
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
    DashboardTopBarComponent,
    CatalogPageComponent,
    NgIconComponent,
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
      { path: 'subscriptions', component: DashboardSubscriptionsPage },
      { path: 'orders', component: DashboardOrdersPage },
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
    provideIcons({ phosphorPackage, phosphorShieldCheck, phosphorCertificate }),
  ],
})
export class DashboardPageModule {}
