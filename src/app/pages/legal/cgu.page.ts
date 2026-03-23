import { Component } from '@angular/core';

@Component({
  selector: 'app-cgu',
  templateUrl: 'cgu.page.html',
  standalone: false,
})
export class CguPage {
  sections = [
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
