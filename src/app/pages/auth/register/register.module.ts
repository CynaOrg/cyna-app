import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterPage } from './register.page';
import { RegisterPageRoutingModule } from './register-routing.module';
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
    InputComponent,
    ButtonComponent,
    BrowserHeaderComponent,
    ResendEmailComponent,
    TranslateModule,
  ],
  declarations: [RegisterPage],
})
export class RegisterPageModule {}
