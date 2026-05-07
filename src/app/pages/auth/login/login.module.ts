import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';
import { CynaLogoComponent } from '@shared/components/cyna-logo/cyna-logo.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ResendEmailComponent } from '@shared/components/resend-email/resend-email.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    LoginPageRoutingModule,
    CynaLogoComponent,
    InputComponent,
    ButtonComponent,
    BrowserHeaderComponent,
    ResendEmailComponent,
    NavbarComponent,
    NgIconComponent,
    TranslateModule,
  ],
  declarations: [LoginPage],
  providers: [provideIcons({ phosphorArrowLeft })],
})
export class LoginPageModule {}
