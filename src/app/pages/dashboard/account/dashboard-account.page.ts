import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-account',
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full bg-background">
        <app-dashboard-topbar title="DASHBOARD.ACCOUNT_TITLE" />
        <div class="p-6 lg:p-8"></div>
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardAccountPage {}
