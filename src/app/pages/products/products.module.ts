import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProductsPage } from './products.page';
import { ProductsPageRoutingModule } from './products-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';

@NgModule({
  imports: [
    IonicModule,
    ProductsPageRoutingModule,
    BrowserHeaderComponent,
    CatalogPageComponent,
  ],
  declarations: [ProductsPage],
})
export class ProductsPageModule {}
