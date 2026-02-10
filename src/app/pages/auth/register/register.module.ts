import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RegisterPage } from './register.page';
import { RegisterPageRoutingModule } from './register-routing.module';
import { CynaLogoComponent } from '@shared/components/cyna-logo/cyna-logo.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ResendEmailComponent } from '@shared/components/resend-email/resend-email.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    RegisterPageRoutingModule,
    CynaLogoComponent,
    InputComponent,
    ButtonComponent,
    BrowserHeaderComponent,
    ResendEmailComponent,
  ],
  declarations: [RegisterPage],
})
export class RegisterPageModule {}
