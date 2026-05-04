import { Component, ViewChild } from '@angular/core';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

@Component({
  selector: 'app-products',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <app-browser-header />
    </ion-header>
    <ion-content [fullscreen]="true">
      <app-pull-to-refresh #refresher (refresh)="onRefresh()" />
      @if (showCatalog) {
        <app-catalog-page
          productType="physical"
          routePrefix="/products"
          title="CATALOG.PRODUCTS_TITLE"
          subtitle="CATALOG.PRODUCTS_SUBTITLE"
        />
      }
    </ion-content>
  `,
})
export class ProductsPage {
  @ViewChild('refresher') refresher?: PullToRefreshComponent;

  showCatalog = true;

  /**
   * Re-mount the catalog component to force a full reload of its internal
   * store. This avoids reaching into the catalog-page (out of scope) while
   * still giving the user a real refresh on pull-down.
   */
  async onRefresh(): Promise<void> {
    this.showCatalog = false;
    await Promise.resolve();
    this.showCatalog = true;
    // Let the new component mount before stopping the spinner.
    setTimeout(() => {
      void this.refresher?.complete();
    }, 400);
  }
}
