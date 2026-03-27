import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-products',
  template: `
    <ion-header class="ion-no-border hidden lg:block">
      <app-dashboard-topbar
        title="CATALOG.PRODUCTS_TITLE"
        subtitle="CATALOG.PRODUCTS_SUBTITLE"
      />
    </ion-header>
    <ion-content>
      <div class="min-h-full bg-background">
        <app-catalog-page
          productType="physical"
          title="CATALOG.PRODUCTS_TITLE"
          subtitle="CATALOG.PRODUCTS_SUBTITLE"
          [hideHeader]="true"
          [compact]="true"
          routePrefix="/dashboard/products"
        />
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardProductsPage {}
