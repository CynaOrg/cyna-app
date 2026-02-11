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

@NgModule({
  declarations: [DashboardPage],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
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
            path: 'licenses',
            loadChildren: () =>
              import('./licenses/licenses.module').then(
                (m) => m.DashboardLicensesModule,
              ),
          },
        ],
      },
    ]),
  ],
  providers: [
    provideIcons({ phosphorPackage, phosphorShieldCheck, phosphorCertificate }),
  ],
})
export class DashboardPageModule {}
