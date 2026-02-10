import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { VerifyEmailPage } from './verify-email.page';
import { VerifyEmailPageRoutingModule } from './verify-email-routing.module';
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    VerifyEmailPageRoutingModule,
  ],
  declarations: [VerifyEmailPage],
})
export class VerifyEmailPageModule {}
