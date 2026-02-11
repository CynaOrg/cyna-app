import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-services',
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full bg-background">
        <app-dashboard-topbar />
        <app-catalog-page
          productType="saas"
          title="CATALOG.SERVICES_TITLE"
          subtitle="CATALOG.SERVICES_SUBTITLE"
        />
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardServicesPage {}
