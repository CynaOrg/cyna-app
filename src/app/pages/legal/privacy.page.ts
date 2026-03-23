import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: 'privacy.page.html',
  standalone: false,
})
export class PrivacyPage {
  sections = [
    {
      titleKey: 'LEGAL.PRIVACY.DATA_COLLECTED_TITLE',
      contentKey: 'LEGAL.PRIVACY.DATA_COLLECTED_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.PURPOSE_TITLE',
      contentKey: 'LEGAL.PRIVACY.PURPOSE_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.LEGAL_BASIS_TITLE',
      contentKey: 'LEGAL.PRIVACY.LEGAL_BASIS_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.RETENTION_TITLE',
      contentKey: 'LEGAL.PRIVACY.RETENTION_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.RIGHTS_TITLE',
      contentKey: 'LEGAL.PRIVACY.RIGHTS_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.COOKIES_TITLE',
      contentKey: 'LEGAL.PRIVACY.COOKIES_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.INTERNATIONAL_TRANSFERS_TITLE',
      contentKey: 'LEGAL.PRIVACY.INTERNATIONAL_TRANSFERS_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.WITHDRAW_CONSENT_TITLE',
      contentKey: 'LEGAL.PRIVACY.WITHDRAW_CONSENT_CONTENT',
    },
    {
      titleKey: 'LEGAL.PRIVACY.AUTOMATED_DECISIONS_TITLE',
      contentKey: 'LEGAL.PRIVACY.AUTOMATED_DECISIONS_CONTENT',
    },
  ];
}
