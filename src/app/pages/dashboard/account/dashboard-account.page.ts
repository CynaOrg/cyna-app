import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard-account',
  template: `
    <ion-content [fullscreen]="true">
      <div
        class="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-8 bg-background p-8"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light"
          >
            <svg
              class="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>

          <h1 class="!m-0 !text-2xl !font-bold text-text-primary">
            {{ 'DASHBOARD.ACCOUNT_TITLE' | translate }}
          </h1>

          @if (user(); as u) {
            <p class="text-sm text-text-secondary">
              {{ u.firstName }} {{ u.lastName }}
            </p>
            <p class="text-xs text-text-secondary">{{ u.email }}</p>
          }
        </div>

        <div
          class="w-full rounded-2xl border border-border-light bg-surface p-8 text-center"
        >
          <p class="text-sm text-text-secondary">
            {{ 'DASHBOARD.ACCOUNT_EMPTY' | translate }}
          </p>
        </div>
      </div>
    </ion-content>
  `,
  standalone: false,
})
export class DashboardAccountPage {
  private readonly authStore = inject(AuthStore);

  user = toSignal(this.authStore.user$, { initialValue: null });
}
