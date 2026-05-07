import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VerifyEmailPage } from './verify-email.page';
import { VerifyEmailPageRoutingModule } from './verify-email-routing.module';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    VerifyEmailPageRoutingModule,
    MobileHeaderComponent,
    NavbarComponent,
    TranslateModule,
  ],
  declarations: [VerifyEmailPage],
})
export class VerifyEmailPageModule {}
