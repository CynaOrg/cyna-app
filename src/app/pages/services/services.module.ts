import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ServicesPage } from './services.page';
import { ServicesPageRoutingModule } from './services-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

@NgModule({
  imports: [
    IonicModule,
    ServicesPageRoutingModule,
    BrowserHeaderComponent,
    CatalogPageComponent,
    PullToRefreshComponent,
  ],
  declarations: [ServicesPage],
})
export class ServicesPageModule {}
