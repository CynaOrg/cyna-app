import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorTrash,
  phosphorMinus,
  phosphorPlus,
  phosphorShoppingCart,
  phosphorArrowLeft,
} from '@ng-icons/phosphor-icons/regular';
import { CartRoutingModule } from './cart-routing.module';
import { CartPage } from './cart.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

@NgModule({
  declarations: [CartPage],
  imports: [
    CommonModule,
    IonicModule,
    CartRoutingModule,
    NgIconComponent,
    BrowserHeaderComponent,
    MobileHeaderComponent,
    NavbarComponent,
    TranslateModule,
  ],
  providers: [
    provideIcons({
      phosphorTrash,
      phosphorMinus,
      phosphorPlus,
      phosphorShoppingCart,
      phosphorArrowLeft,
    }),
  ],
})
export class CartPageModule {}
