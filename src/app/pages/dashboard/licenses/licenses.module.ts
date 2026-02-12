import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorCertificate } from '@ng-icons/phosphor-icons/regular';
import { DashboardLicensesPage } from './licenses.page';

@NgModule({
  declarations: [DashboardLicensesPage],
  imports: [
    CommonModule,
    NgIconComponent,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: DashboardLicensesPage }]),
  ],
  providers: [provideIcons({ phosphorCertificate })],
})
export class DashboardLicensesModule {}
