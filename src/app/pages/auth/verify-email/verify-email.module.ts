import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { VerifyEmailPage } from './verify-email.page';
import { VerifyEmailPageRoutingModule } from './verify-email-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    VerifyEmailPageRoutingModule,
    BrowserHeaderComponent,
    ButtonComponent,
  ],
  declarations: [VerifyEmailPage],
})
export class VerifyEmailPageModule {}
