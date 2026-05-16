import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';
import { SubscriptionConfirmationRoutingModule } from './subscription-confirmation-routing.module';
import { SubscriptionConfirmationPage } from './subscription-confirmation.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { TtcPipe } from '@shared/pipes/ttc.pipe';

@NgModule({
  declarations: [SubscriptionConfirmationPage],
  imports: [
    CommonModule,
    IonicModule,
    SubscriptionConfirmationRoutingModule,
    NgIconComponent,
    TranslateModule,
    BrowserHeaderComponent,
    MobileHeaderComponent,
    DashboardTopBarComponent,
    TtcPipe,
  ],
  providers: [
    provideIcons({
      phosphorWarningCircle,
    }),
  ],
})
export class SubscriptionConfirmationPageModule {}
