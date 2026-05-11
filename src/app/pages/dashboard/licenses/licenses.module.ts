import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorCertificate,
  phosphorKey,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { MobileListSkeletonComponent } from '@shared/components/mobile-list-skeleton/mobile-list-skeleton.component';
import { DashboardLicensesPage } from './licenses.page';

@NgModule({
  declarations: [DashboardLicensesPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    MobilePageShellComponent,
    MobileStateComponent,
    MobileListSkeletonComponent,
    RouterModule.forChild([{ path: '', component: DashboardLicensesPage }]),
  ],
  providers: [
    provideIcons({ phosphorCertificate, phosphorKey, phosphorWarning }),
  ],
})
export class DashboardLicensesModule {}
