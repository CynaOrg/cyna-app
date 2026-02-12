import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { SubscribeRoutingModule } from './subscribe-routing.module';
import { SubscribePage } from './subscribe.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import { StripePaymentElementComponent } from '@shared/components/stripe-payment-element/stripe-payment-element.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';

@NgModule({
  declarations: [SubscribePage],
  imports: [
    CommonModule,
    IonicModule,
    SubscribeRoutingModule,
    NgIconComponent,
    TranslateModule,
    BrowserHeaderComponent,
    MobileHeaderComponent,
    AddressFormComponent,
    StripePaymentElementComponent,
    DashboardTopBarComponent,
  ],
  providers: [
    provideIcons({
      phosphorArrowLeft,
    }),
  ],
})
export class SubscribePageModule {}
