import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';
import { OrderConfirmationRoutingModule } from './order-confirmation-routing.module';
import { OrderConfirmationPage } from './order-confirmation.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';

@NgModule({
  declarations: [OrderConfirmationPage],
  imports: [
    CommonModule,
    IonicModule,
    OrderConfirmationRoutingModule,
    NgIconComponent,
    TranslateModule,
    BrowserHeaderComponent,
    MobileHeaderComponent,
    DashboardTopBarComponent,
  ],
  providers: [
    provideIcons({
      phosphorWarningCircle,
    }),
  ],
})
export class OrderConfirmationPageModule {}
