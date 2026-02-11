import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-products',
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full bg-background">
        <app-dashboard-topbar
          title="CATALOG.PRODUCTS_TITLE"
          subtitle="CATALOG.PRODUCTS_SUBTITLE"
        />
        <app-catalog-page
          productType="physical"
          title="CATALOG.PRODUCTS_TITLE"
          subtitle="CATALOG.PRODUCTS_SUBTITLE"
          [hideHeader]="true"
        />
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardProductsPage {}
