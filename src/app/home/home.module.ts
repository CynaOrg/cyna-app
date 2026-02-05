import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/index';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ProductListComponent } from '@shared/components/product-list/product-list.component';

import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MobileHeaderComponent,
    NavbarComponent,
    BrowserHeaderComponent,
    ProductListComponent,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
