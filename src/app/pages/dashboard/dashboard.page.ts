import { Component, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);

  user = toSignal(this.authStore.user$, { initialValue: null });

  logout(): void {
    this.authStore.logout();
  }
}
