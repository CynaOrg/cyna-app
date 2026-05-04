import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorPackage } from '@ng-icons/phosphor-icons/regular';
import { DashboardOrdersPage } from './orders.page';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

@NgModule({
  declarations: [DashboardOrdersPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
    RouterModule.forChild([{ path: '', component: DashboardOrdersPage }]),
  ],
  providers: [provideIcons({ phosphorPackage })],
})
export class DashboardOrdersModule {}
