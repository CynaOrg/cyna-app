import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-licenses',
  template: `
    <ion-header class="ion-no-border">
      <app-dashboard-topbar
        title="CATALOG.LICENSES_TITLE"
        subtitle="CATALOG.LICENSES_SUBTITLE"
      />
    </ion-header>
    <ion-content>
      <div class="min-h-full bg-background">
        <app-dashboard-topbar
          title="CATALOG.LICENSES_TITLE"
          subtitle="CATALOG.LICENSES_SUBTITLE"
          [mobileOnly]="true"
        />
        <app-catalog-page
          productType="license"
          title="CATALOG.LICENSES_TITLE"
          subtitle="CATALOG.LICENSES_SUBTITLE"
          [hideHeader]="true"
          [compact]="true"
          routePrefix="/dashboard/licenses"
        />
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardLicensesPage {}
