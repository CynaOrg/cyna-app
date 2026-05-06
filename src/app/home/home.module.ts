import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HomePage } from './home.page';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/index';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ProductListComponent } from '@shared/components/product-list/product-list.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ProductCardSkeletonComponent } from '@shared/components/product-card-skeleton/product-card-skeleton.component';

import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    HomePageRoutingModule,
    MobileHeaderComponent,
    NavbarComponent,
    BrowserHeaderComponent,
    ProductListComponent,
    ProductCardComponent,
    SectionHeaderComponent,
    ProductCardSkeletonComponent,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
