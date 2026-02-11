import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <app-browser-header />
    </ion-header>
    <ion-content [fullscreen]="true">
      <app-catalog-page
        productType="physical"
        title="CATALOG.PRODUCTS_TITLE"
        subtitle="CATALOG.PRODUCTS_SUBTITLE"
      />
    </ion-content>
  `,
})
export class ProductsPage {}
