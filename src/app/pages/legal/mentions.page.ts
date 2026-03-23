import { Component } from '@angular/core';

@Component({
  selector: 'app-mentions',
  templateUrl: 'mentions.page.html',
  standalone: false,
})
export class MentionsPage {
  editorFields = [
    'LEGAL.MENTIONS.EDITOR_NAME',
    'LEGAL.MENTIONS.EDITOR_FORM',
    'LEGAL.MENTIONS.EDITOR_SIEGE',
    'LEGAL.MENTIONS.EDITOR_RCS_SIRET',
    'LEGAL.MENTIONS.EDITOR_VAT',
    'LEGAL.MENTIONS.EDITOR_EMAIL',
    'LEGAL.MENTIONS.EDITOR_PHONE',
    'LEGAL.MENTIONS.EDITOR_DIRECTOR',
  ];

  hostFields = [
    'LEGAL.MENTIONS.HOST_NAME',
    'LEGAL.MENTIONS.HOST_ADDRESS',
    'LEGAL.MENTIONS.HOST_WEBSITE',
  ];

  sections = [
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
