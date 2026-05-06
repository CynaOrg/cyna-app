import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

export type MobileHeaderVariant = 'home' | 'title' | 'back';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [NgIconComponent, CynaLogoComponent, RouterLink, TranslateModule],
  viewProviders: [
    provideIcons({
      phosphorArrowLeft,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorTrash,
    }),
  ],
  template: `
    <header
      class="relative flex h-[80px] w-full items-center justify-between bg-surface px-4 py-2.5"
    >
      @switch (variant()) {
        @case ('back') {
          <button
            type="button"
            class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
            aria-label="Back"
            (click)="goBack()"
          >
            <ng-icon name="phosphorArrowLeft" size="18" />
          </button>

          <h1
            class="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-text-primary"
          >
            {{ title() | translate }}
          </h1>

          <span class="h-[38px] w-[38px]"></span>
        }
        @case ('title') {
          <span class="h-[38px] w-[38px]"></span>

          <h1
            class="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-text-primary"
          >
            {{ title() | translate }}
          </h1>

          @if (actionIcon()) {
            <button
              type="button"
              class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6] transition-opacity"
              [class.opacity-30]="actionDisabled()"
              [attr.aria-label]="actionLabel()"
              [disabled]="actionDisabled()"
              (click)="actionClick.emit()"
            >
              <ng-icon [name]="actionIcon()!" size="18" />
            </button>
          } @else {
            <div class="flex items-center gap-2.5">
              <button
                class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
                aria-label="Search"
                (click)="openSearch()"
              >
                <ng-icon name="phosphorMagnifyingGlass" size="18" />
              </button>

              <a
                routerLink="/cart"
                class="relative"
                style="text-decoration: none"
              >
                <div
                  class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
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
          }
        }
        @default {
          <app-cyna-logo variant="mark" color="#0A0A0A" />

          <div class="flex items-center gap-2.5">
            <button
              class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
              aria-label="Search"
              (click)="openSearch()"
            >
              <ng-icon name="phosphorMagnifyingGlass" size="18" />
            </button>

            <a
              routerLink="/cart"
              class="relative"
              style="text-decoration: none"
            >
              <div
                class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
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
        }
      }
    </header>
  `,
})
export class MobileHeaderComponent {
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  private readonly location = inject(Location);

  variant = input<MobileHeaderVariant>('home');
  title = input<string>('');
  /**
   * Optional icon name (e.g. "phosphorTrash") for an action button rendered
   * on the right side of the `title` variant. When set, the search + cart
   * icons are hidden in favor of the action button.
   */
  actionIcon = input<string | null>(null);
  actionLabel = input<string>('Action');
  actionDisabled = input<boolean>(false);

  @Output() actionClick = new EventEmitter<void>();

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  openSearch(): void {
    this.searchService.open();
  }

  goBack(): void {
    this.location.back();
  }
}
