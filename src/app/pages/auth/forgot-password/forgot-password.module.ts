import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ForgotPasswordPage } from './forgot-password.page';
import { ForgotPasswordPageRoutingModule } from './forgot-password-routing.module';
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
    InputComponent,
    ButtonComponent,
    BrowserHeaderComponent,
    TranslateModule,
  ],
  declarations: [ForgotPasswordPage],
})
export class ForgotPasswordPageModule {}
