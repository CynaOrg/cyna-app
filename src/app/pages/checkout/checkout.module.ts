import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutPage } from './checkout.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import { AddressPickerComponent } from '@shared/components/address-picker/address-picker.component';
import { StripePaymentElementComponent } from '@shared/components/stripe-payment-element/stripe-payment-element.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';

@NgModule({
  declarations: [CheckoutPage],
  imports: [
    CommonModule,
    IonicModule,
    CheckoutRoutingModule,
    NgIconComponent,
    TranslateModule,
    BrowserHeaderComponent,
    MobileHeaderComponent,
    AddressFormComponent,
    AddressPickerComponent,
    StripePaymentElementComponent,
    OrderSummaryComponent,
    DashboardTopBarComponent,
  ],
  providers: [
    provideIcons({
      phosphorArrowLeft,
    }),
  ],
})
export class CheckoutPageModule {}
