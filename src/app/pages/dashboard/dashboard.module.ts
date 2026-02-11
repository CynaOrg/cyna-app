import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardPage } from './dashboard.page';
import { DashboardAccountPage } from './account/dashboard-account.page';

@NgModule({
  declarations: [DashboardPage, DashboardAccountPage],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild([
      { path: '', component: DashboardPage },
      { path: 'account', component: DashboardAccountPage },
    ]),
  ],
})
export class DashboardPageModule {}
