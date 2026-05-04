import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorShieldCheck } from '@ng-icons/phosphor-icons/regular';
import { DashboardSubscriptionsPage } from './subscriptions.page';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

@NgModule({
  declarations: [DashboardSubscriptionsPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
    RouterModule.forChild([
      { path: '', component: DashboardSubscriptionsPage },
    ]),
  ],
  providers: [provideIcons({ phosphorShieldCheck })],
})
export class DashboardSubscriptionsModule {}
