import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <app-browser-header />
    </ion-header>
    <ion-content [fullscreen]="true">
      <app-catalog-page
        productType="saas"
        title="CATALOG.SERVICES_TITLE"
        subtitle="CATALOG.SERVICES_SUBTITLE"
      />
    </ion-content>
  `,
})
export class ServicesPage {}
