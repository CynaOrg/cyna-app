import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorPackage } from '@ng-icons/phosphor-icons/regular';
import { DashboardOrdersPage } from './orders.page';

@NgModule({
  declarations: [DashboardOrdersPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: DashboardOrdersPage }]),
  ],
  providers: [provideIcons({ phosphorPackage })],
})
export class DashboardOrdersModule {}
