import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  user = toSignal(this.authStore.user$, { initialValue: null });

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  hasChildRoute = computed(() => this.currentUrl() !== '/dashboard');
}
