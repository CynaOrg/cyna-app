import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-services',
  template: `
    <ion-header class="ion-no-border hidden lg:block">
      <app-dashboard-topbar
        title="CATALOG.SERVICES_TITLE"
        subtitle="CATALOG.SERVICES_SUBTITLE"
      />
    </ion-header>
    <ion-content>
      <div class="min-h-full bg-background">
        <app-catalog-page
          productType="saas"
          title="CATALOG.SERVICES_TITLE"
          subtitle="CATALOG.SERVICES_SUBTITLE"
          [hideHeader]="true"
          [compact]="true"
          routePrefix="/dashboard/services"
        />
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardServicesPage {}
