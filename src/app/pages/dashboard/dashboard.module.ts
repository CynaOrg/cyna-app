import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardPage } from './dashboard.page';
import { DashboardSidebarComponent } from '@shared/components/dashboard-sidebar/dashboard-sidebar.component';

@NgModule({
  declarations: [DashboardPage],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    DashboardSidebarComponent,
    RouterModule.forChild([{ path: '', component: DashboardPage }]),
  ],
})
export class DashboardPageModule {}
