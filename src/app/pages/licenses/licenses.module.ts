import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LicensesPage } from './licenses.page';
import { LicensesPageRoutingModule } from './licenses-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';

@NgModule({
  imports: [
    IonicModule,
    LicensesPageRoutingModule,
    BrowserHeaderComponent,
    CatalogPageComponent,
  ],
  declarations: [LicensesPage],
})
export class LicensesPageModule {}
