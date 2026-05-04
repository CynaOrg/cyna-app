import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NativePageHeaderComponent } from '../../components/native-page-header.component';

/**
 * Native mentions légales page mounted at `/m/legal/mentions`.
 */
@Component({
  selector: 'app-mentions-native',
  standalone: true,
  imports: [IonicModule, TranslateModule, NativePageHeaderComponent],
  templateUrl: './mentions-native.page.html',
})
export class MentionsNativePage {
  readonly editorFields = [
    'LEGAL.MENTIONS.EDITOR_NAME',
    'LEGAL.MENTIONS.EDITOR_FORM',
    'LEGAL.MENTIONS.EDITOR_SIEGE',
    'LEGAL.MENTIONS.EDITOR_RCS_SIRET',
    'LEGAL.MENTIONS.EDITOR_VAT',
    'LEGAL.MENTIONS.EDITOR_EMAIL',
    'LEGAL.MENTIONS.EDITOR_PHONE',
    'LEGAL.MENTIONS.EDITOR_DIRECTOR',
  ];

  readonly hostFields = [
    'LEGAL.MENTIONS.HOST_NAME',
    'LEGAL.MENTIONS.HOST_ADDRESS',
    'LEGAL.MENTIONS.HOST_WEBSITE',
  ];

  readonly sections = [
    {
      titleKey: 'LEGAL.MENTIONS.IP_TITLE',
      contentKey: 'LEGAL.MENTIONS.IP_CONTENT',
    },
    {
      titleKey: 'LEGAL.MENTIONS.LIABILITY_TITLE',
      contentKey: 'LEGAL.MENTIONS.LIABILITY_CONTENT',
    },
    {
      titleKey: 'LEGAL.MENTIONS.LAW_TITLE',
      contentKey: 'LEGAL.MENTIONS.LAW_CONTENT',
    },
  ];
}
