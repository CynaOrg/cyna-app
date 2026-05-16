import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorShieldCheck,
  phosphorReceipt,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { MobileListSkeletonComponent } from '@shared/components/mobile-list-skeleton/mobile-list-skeleton.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { LocalizedDatePipe } from '@shared/pipes/localized-date.pipe';
import { TtcPipe } from '@shared/pipes/ttc.pipe';
import { DashboardSubscriptionsPage } from './subscriptions.page';

@NgModule({
  declarations: [DashboardSubscriptionsPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    MobilePageShellComponent,
    MobileStateComponent,
    MobileListSkeletonComponent,
    ConfirmDialogComponent,
    LocalizedDatePipe,
    TtcPipe,
    RouterModule.forChild([
      { path: '', component: DashboardSubscriptionsPage },
    ]),
  ],
  providers: [
    provideIcons({ phosphorShieldCheck, phosphorReceipt, phosphorWarning }),
  ],
})
export class DashboardSubscriptionsModule {}
