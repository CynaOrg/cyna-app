import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ForgotPasswordPage } from './forgot-password.page';
import { ForgotPasswordPageRoutingModule } from './forgot-password-routing.module';
import { CynaLogoComponent } from '@shared/components/cyna-logo/cyna-logo.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    ForgotPasswordPageRoutingModule,
    CynaLogoComponent,
    InputComponent,
    ButtonComponent,
    BrowserHeaderComponent,
  ],
  declarations: [ForgotPasswordPage],
})
export class ForgotPasswordPageModule {}
