import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LegalRoutingModule } from './legal-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MentionsPage } from './mentions.page';
import { CguPage } from './cgu.page';
import { PrivacyPage } from './privacy.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LegalRoutingModule,
    BrowserHeaderComponent,
    TranslateModule,
  ],
  declarations: [MentionsPage, CguPage, PrivacyPage],
})
export class LegalModule {}
