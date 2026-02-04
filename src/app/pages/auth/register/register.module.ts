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
  ],
  declarations: [RegisterPage],
})
export class RegisterPageModule {}
