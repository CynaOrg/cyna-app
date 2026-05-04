import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LicensesPage } from './licenses.page';
import { LicensesPageRoutingModule } from './licenses-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

@NgModule({
  imports: [
    IonicModule,
    LicensesPageRoutingModule,
    BrowserHeaderComponent,
    CatalogPageComponent,
    PullToRefreshComponent,
  ],
  declarations: [LicensesPage],
})
export class LicensesPageModule {}
