import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NativePageHeaderComponent } from '../../components/native-page-header.component';

/**
 * Native CGU page mounted at `/m/legal/cgu`.
 *
 * Re-uses the same i18n keys as the web `CguPage` so a translator only ever
 * touches one set of strings. Renders the sections in a long, scrollable
 * article with safe-area-aware paddings.
 */
@Component({
  selector: 'app-cgu-native',
  standalone: true,
  imports: [IonicModule, TranslateModule, NativePageHeaderComponent],
  templateUrl: './cgu-native.page.html',
})
export class CguNativePage {
  readonly sections = [
    {
      titleKey: 'LEGAL.CGU.OBJECT_TITLE',
      contentKey: 'LEGAL.CGU.OBJECT_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.ACCEPTANCE_TITLE',
      contentKey: 'LEGAL.CGU.ACCEPTANCE_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.SERVICES_TITLE',
      contentKey: 'LEGAL.CGU.SERVICES_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.ACCOUNT_TITLE',
      contentKey: 'LEGAL.CGU.ACCOUNT_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.PRICING_TITLE',
      contentKey: 'LEGAL.CGU.PRICING_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.WITHDRAWAL_TITLE',
      contentKey: 'LEGAL.CGU.WITHDRAWAL_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.LIABILITY_TITLE',
      contentKey: 'LEGAL.CGU.LIABILITY_CONTENT',
    },
    { titleKey: 'LEGAL.CGU.DATA_TITLE', contentKey: 'LEGAL.CGU.DATA_CONTENT' },
    {
      titleKey: 'LEGAL.CGU.CHANGES_TITLE',
      contentKey: 'LEGAL.CGU.CHANGES_CONTENT',
    },
    {
      titleKey: 'LEGAL.CGU.DISPUTES_TITLE',
      contentKey: 'LEGAL.CGU.DISPUTES_CONTENT',
    },
  ];
}
