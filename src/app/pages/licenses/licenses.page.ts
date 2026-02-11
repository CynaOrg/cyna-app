import { Component } from '@angular/core';

@Component({
  selector: 'app-licenses',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <app-browser-header />
    </ion-header>
    <ion-content [fullscreen]="true">
      <app-catalog-page
        productType="license"
        title="CATALOG.LICENSES_TITLE"
        subtitle="CATALOG.LICENSES_SUBTITLE"
      />
    </ion-content>
  `,
})
export class LicensesPage {}
