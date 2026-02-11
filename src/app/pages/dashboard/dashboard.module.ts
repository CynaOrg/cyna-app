import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorShieldCheck,
  phosphorEnvelopeSimple,
} from '@ng-icons/phosphor-icons/regular';
import { DashboardPage } from './dashboard.page';
import { DashboardAccountPage } from './account/dashboard-account.page';
import { DashboardSubscriptionsPage } from './subscriptions/dashboard-subscriptions.page';
import { DashboardOrdersPage } from './orders/dashboard-orders.page';

@NgModule({
  declarations: [
    DashboardPage,
    DashboardAccountPage,
    DashboardSubscriptionsPage,
    DashboardOrdersPage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgIconComponent,
    RouterModule.forChild([
      { path: '', component: DashboardPage },
      { path: 'account', component: DashboardAccountPage },
      { path: 'subscriptions', component: DashboardSubscriptionsPage },
      { path: 'orders', component: DashboardOrdersPage },
    ]),
  ],
  providers: [
    provideIcons({
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorShieldCheck,
      phosphorEnvelopeSimple,
    }),
  ],
})
export class DashboardPageModule {}
