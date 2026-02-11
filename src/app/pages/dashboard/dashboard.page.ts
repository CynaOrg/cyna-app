import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage {
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);

  user = toSignal(this.authStore.user$, { initialValue: null });
  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  userInitials = computed(() => {
    const u = this.user();
    if (!u) return '';
    return (
      (u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')
    ).toUpperCase();
  });

  openSearch(): void {
    this.searchService.open();
  }
}
