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

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [NgIconComponent, CynaLogoComponent, RouterLink],
  viewProviders: [
    provideIcons({ phosphorMagnifyingGlass, phosphorShoppingCart }),
  ],
  template: `
    <header
      class="flex h-[80px] w-full items-center justify-between bg-surface px-8 py-2.5"
    >
      <app-cyna-logo variant="mark" color="#0A0A0A" />

      <div class="flex items-center gap-2.5">
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
          aria-label="Search"
          (click)="openSearch()"
        >
          <ng-icon name="phosphorMagnifyingGlass" size="18" />
        </button>

        <a routerLink="/cart" class="relative" style="text-decoration: none">
          <div
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
          >
            <ng-icon name="phosphorShoppingCart" size="18" />
          </div>
          @if (cartCount() > 0) {
            <span
              class="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] leading-none text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>
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
