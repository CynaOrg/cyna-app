import { Component, ViewChild } from '@angular/core';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

@Component({
  selector: 'app-licenses',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <app-browser-header />
    </ion-header>
    <ion-content [fullscreen]="true">
      <app-pull-to-refresh #refresher (refresh)="onRefresh()" />
      @if (showCatalog) {
        <app-catalog-page
          productType="license"
          routePrefix="/licenses"
          title="CATALOG.LICENSES_TITLE"
          subtitle="CATALOG.LICENSES_SUBTITLE"
        />
      }
    </ion-content>
  `,
})
export class LicensesPage {
  @ViewChild('refresher') refresher?: PullToRefreshComponent;

  showCatalog = true;

  async onRefresh(): Promise<void> {
    this.showCatalog = false;
    await Promise.resolve();
    this.showCatalog = true;
    setTimeout(() => {
      void this.refresher?.complete();
    }, 400);
  }
}
