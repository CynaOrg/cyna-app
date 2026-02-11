import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ServicesPage } from './services.page';
import { ServicesPageRoutingModule } from './services-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';

@NgModule({
  imports: [
    IonicModule,
    ServicesPageRoutingModule,
    BrowserHeaderComponent,
    CatalogPageComponent,
  ],
  declarations: [ServicesPage],
})
export class ServicesPageModule {}
