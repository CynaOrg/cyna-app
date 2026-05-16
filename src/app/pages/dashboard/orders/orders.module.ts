import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorPackage,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { MobileListSkeletonComponent } from '@shared/components/mobile-list-skeleton/mobile-list-skeleton.component';
import { LocalizedDatePipe } from '@shared/pipes/localized-date.pipe';
import { TtcPipe } from '@shared/pipes/ttc.pipe';
import { DashboardOrdersPage } from './orders.page';

@NgModule({
  declarations: [DashboardOrdersPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    MobilePageShellComponent,
    MobileStateComponent,
    MobileListSkeletonComponent,
    LocalizedDatePipe,
    TtcPipe,
    RouterModule.forChild([{ path: '', component: DashboardOrdersPage }]),
  ],
  providers: [provideIcons({ phosphorPackage, phosphorWarning })],
})
export class DashboardOrdersModule {}
