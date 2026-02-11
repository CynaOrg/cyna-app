import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-subscriptions',
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full bg-background">
        <div
          class="flex items-center justify-between border-b border-border-light bg-surface px-6 py-4 lg:px-8"
        >
          <h1 class="!m-0 text-xl font-bold text-text-primary">
            {{ 'DASHBOARD.SUBSCRIPTIONS_TITLE' | translate }}
          </h1>
        </div>
        <div class="p-6 lg:p-8">
          <div
            class="flex min-h-[200px] items-center justify-center rounded-2xl border border-border-light bg-surface p-8"
          >
            <p class="text-sm text-text-secondary">
              {{ 'DASHBOARD.SUBSCRIPTIONS_EMPTY' | translate }}
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardSubscriptionsPage {}
