import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorShareNetwork,
  phosphorShoppingCart,
} from '@ng-icons/phosphor-icons/regular';
import { ProductDetailRoutingModule } from './product-detail-routing.module';
import { ProductDetailPage } from './product-detail.page';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@NgModule({
  declarations: [ProductDetailPage],
  imports: [
    CommonModule,
    IonicModule,
    ProductDetailRoutingModule,
    ProductCardComponent,
    NgIconComponent,
    BrowserHeaderComponent,
    ButtonComponent,
  ],
  providers: [
    provideIcons({
      phosphorArrowLeft,
      phosphorShareNetwork,
      phosphorShoppingCart,
    }),
  ],
})
export class ProductDetailPageModule {}
