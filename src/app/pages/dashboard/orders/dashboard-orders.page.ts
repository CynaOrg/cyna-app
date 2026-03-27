import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-orders',
  template: `
    <ion-header class="ion-no-border hidden lg:block">
      <app-dashboard-topbar title="DASHBOARD.ORDERS_TITLE" />
    </ion-header>
    <ion-content>
      <div class="min-h-full bg-background">
        <div class="p-6 lg:p-8"></div>
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardOrdersPage {}
