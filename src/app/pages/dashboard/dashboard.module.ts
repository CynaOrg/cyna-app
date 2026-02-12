import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
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
    RouterModule.forChild([
      { path: '', component: DashboardPage },
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
    ]),
  ],
})
export class DashboardPageModule {}
