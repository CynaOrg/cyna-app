import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EmailSentPage } from './email-sent.page';
import { EmailSentPageRoutingModule } from './email-sent-routing.module';
import { ResendEmailComponent } from '@shared/components/resend-email/resend-email.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    EmailSentPageRoutingModule,
    ResendEmailComponent,
    TranslateModule,
  ],
  declarations: [EmailSentPage],
})
export class EmailSentPageModule {}
