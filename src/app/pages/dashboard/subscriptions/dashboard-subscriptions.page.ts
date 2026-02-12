import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-subscriptions',
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full bg-background">
        <app-dashboard-topbar title="DASHBOARD.SUBSCRIPTIONS_TITLE" />
        <div class="p-6 lg:p-8"></div>
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardSubscriptionsPage {}
