import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorShieldCheck } from '@ng-icons/phosphor-icons/regular';
import { DashboardSubscriptionsPage } from './subscriptions.page';

@NgModule({
  declarations: [DashboardSubscriptionsPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    RouterModule.forChild([
      { path: '', component: DashboardSubscriptionsPage },
    ]),
  ],
  providers: [provideIcons({ phosphorShieldCheck })],
})
export class DashboardSubscriptionsModule {}
