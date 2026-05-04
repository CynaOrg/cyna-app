import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
} from '@ng-icons/phosphor-icons/regular';
import { CynaLogoComponent } from '@shared/components/cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

/**
 * Native mobile topbar.
 *
 * Pinned to the top of the native shell with iOS-style glassmorphism and a
 * `safe-area-inset-top` padding so it sits flush under the status bar. Lives
 * exclusively under `src/app/native/` — the web header
 * (`app-mobile-header`) keeps its own untouched layout.
 */
@Component({
  selector: 'app-native-mobile-header',
  standalone: true,
  imports: [NgIconComponent, CynaLogoComponent, RouterLink],
  viewProviders: [
    provideIcons({ phosphorMagnifyingGlass, phosphorShoppingCart }),
  ],
  template: `
    <header
      class="sticky top-0 z-30 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl"
      style="padding-top: env(safe-area-inset-top);"
    >
      <div class="flex h-14 w-full items-center justify-between px-4">
        <app-cyna-logo variant="mark" color="#0A0A0A" height="28" />

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5]"
            aria-label="Search"
            (click)="openSearch()"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="18" />
          </button>

          <a
            routerLink="/m/cart"
            class="relative"
            aria-label="Cart"
            style="text-decoration: none;"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5]"
              style="color: #0a0a0a;"
            >
              <ng-icon name="phosphorShoppingCart" size="18" />
            </span>
            @if (cartCount() > 0) {
              <span
                class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white"
              >
                {{ cartCount() }}
              </span>
            }
          </a>
        </div>
      </div>
    </header>
  `,
})
export class NativeMobileHeaderComponent {
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);

  readonly cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  openSearch(): void {
    this.searchService.open();
  }
}
