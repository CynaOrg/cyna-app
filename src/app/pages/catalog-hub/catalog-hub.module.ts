import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CatalogHubPage } from './catalog-hub.page';
import { CatalogHubPageRoutingModule } from './catalog-hub-routing.module';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { ProductListComponent } from '@shared/components/product-list/product-list.component';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule,
    CatalogHubPageRoutingModule,
    MobileHeaderComponent,
    NavbarComponent,
    ProductListComponent,
    PullToRefreshComponent,
  ],
  declarations: [CatalogHubPage],
})
export class CatalogHubPageModule {}
