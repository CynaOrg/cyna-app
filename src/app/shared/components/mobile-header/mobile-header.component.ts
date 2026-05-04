import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
} from '@ng-icons/phosphor-icons/regular';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

/**
 * Marketing-side mobile top header.
 *
 * Native polish (B10.1):
 *  - Sticky with glassmorphism (semi-transparent surface + backdrop blur),
 *    matching the dashboard topbar visual language.
 *  - Respects iOS safe-area-top so the title row never collides with the
 *    status bar on notched / Dynamic Island devices.
 *  - Bottom hairline border to separate from page content on scroll.
 *  - Action buttons reuse the sidebar-style icons (Phosphor regular, sober).
 */
@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [NgIconComponent, CynaLogoComponent, RouterLink],
  viewProviders: [
    provideIcons({ phosphorMagnifyingGlass, phosphorShoppingCart }),
  ],
  template: `
    <header
      class="sticky top-0 z-30 w-full border-b border-border-light bg-surface/80 backdrop-blur-xl"
      style="padding-top: env(safe-area-inset-top);"
    >
      <div class="flex h-14 items-center justify-between px-4">
        <a routerLink="/home" aria-label="Cyna" style="text-decoration: none">
          <app-cyna-logo variant="mark" color="#0A0A0A" />
        </a>

        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center overflow-hidden !rounded-full border-none bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a; cursor: pointer"
            aria-label="Search"
            (click)="openSearch()"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <a
            routerLink="/cart"
            class="relative flex h-9 w-9 items-center justify-center !rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a; text-decoration: none"
            aria-label="Cart"
          >
            <ng-icon name="phosphorShoppingCart" size="20" />
            @if (cartCount() > 0) {
              <span
                class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-white"
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
export class MobileHeaderComponent {
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  openSearch(): void {
    this.searchService.open();
  }
}
