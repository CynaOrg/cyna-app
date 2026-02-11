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
      { path: 'services', component: DashboardServicesPage },
      { path: 'licenses', component: DashboardLicensesPage },
    ]),
  ],
})
export class DashboardPageModule {}
