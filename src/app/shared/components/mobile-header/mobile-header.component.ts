import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Output,
} from '@angular/core';
import { Location, NgClass } from '@angular/common';
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

/**
 * Unified topbar pattern for native mobile pages.
 *
 * Layout (always 3 zones):
 *   [LEFT]   logo Cyna (linked to /home)  OR  back button (when showBack)
 *   [CENTER] page title (i18n key, always shown)
 *   [RIGHT]  configurable: action button (e.g. trash) OR search+cart OR nothing
 *
 * The logo is replaced by the back button only when `showBack` is true.
 * That is the SOLE exception to the "always show logo" rule.
 *
 * Inputs:
 *  - title         i18n key for the centered title
 *  - showBack      hides logo, shows native iOS back button (Location.back())
 *  - actionIcon    name of a phosphor icon to render as a single right action
 *  - actionLabel   aria-label for the action button
 *  - actionDisabled  greys out the action button
 *  - showCart      show the cart icon on the right (top-level browse pages)
 *  - showSearch    show the magnifier on the right (top-level browse pages)
 *  - scrolled      when true, applies the glassmorphism style (bg/80 + blur)
 *
 * `actionIcon` can be combined with `showCart` and `showSearch`: the
 * action button is rendered to the LEFT of the search/cart icons in the
 * right zone (e.g. `+` add-address combined with cart/search).
 * If no right item is requested, a 38x38 spacer keeps the title visually
 * centered.
 */
@Component({
  selector: 'app-mobile-header',
  standalone: true,
  host: { class: 'block' },
  imports: [
    NgClass,
    NgIconComponent,
    CynaLogoComponent,
    RouterLink,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowLeft,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorTrash,
    }),
  ],
  template: `
    <header [ngClass]="headerClasses()" [style.top]="headerTop">
      <nav [ngClass]="navClasses()">
        <!-- LEFT zone: back button OR logo -->
        @if (showBack()) {
          <button
            type="button"
            class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
            aria-label="Back"
            (click)="goBack()"
          >
            <ng-icon name="phosphorArrowLeft" size="18" />
          </button>
        } @else {
          <a
            routerLink="/home"
            class="flex items-center"
            style="text-decoration: none"
            aria-label="Home"
          >
            <app-cyna-logo variant="mark" color="#0A0A0A" />
          </a>
        }

        <!-- CENTER zone: page title -->
        @if (title()) {
          <h1
            class="absolute left-1/2 max-w-[140px] -translate-x-1/2 truncate text-center text-base font-semibold text-text-primary"
          >
            {{ title() | translate }}
          </h1>
        }

        <!-- RIGHT zone: action button + cart+search (combinable) OR spacer -->
        @if (actionIcon() || showCart() || showSearch()) {
          <div class="flex items-center gap-2.5">
            @if (actionIcon()) {
              <button
                type="button"
                class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6] transition-opacity"
                style="color: #0a0a0a"
                [class.opacity-30]="actionDisabled()"
                [attr.aria-label]="actionLabel()"
                [disabled]="actionDisabled()"
                (click)="actionClick.emit()"
              >
                <ng-icon [name]="actionIcon()!" size="18" />
              </button>
            }

            @if (showSearch()) {
              <button
                class="flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6]"
                style="color: #0a0a0a"
                aria-label="Search"
                (click)="openSearch()"
              >
                <ng-icon name="phosphorMagnifyingGlass" size="18" />
              </button>
            }

            @if (showCart()) {
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
            }
          </div>
        } @else {
          <span class="h-[38px] w-[38px]"></span>
        }
      </nav>
    </header>
  `,
})
export class MobileHeaderComponent {
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  private readonly location = inject(Location);

  /** i18n key for the centered title. Always shown when truthy. */
  title = input<string>('');

  /** When true, hides the logo and renders a back button on the left. */
  showBack = input<boolean>(false);

  /**
   * Optional icon name (e.g. "phosphorTrash") for a single right-side action
   * button. When set, `showCart` and `showSearch` are ignored.
   */
  actionIcon = input<string | null>(null);
  actionLabel = input<string>('Action');
  actionDisabled = input<boolean>(false);

  /** Show the cart icon on the right (top-level browse pages). */
  showCart = input<boolean>(false);
  /** Show the magnifier on the right (top-level browse pages). */
  showSearch = input<boolean>(false);

  /** Apply glassmorphism style when the underlying page is scrolled. */
  scrolled = input<boolean>(false);

  @Output() actionClick = new EventEmitter<void>();

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  /**
   * Floating wrapper classes — mirrors the web browser-header `headerClasses()`
   * contract exactly:
   *  - At top: full-width transparent bar (no bg, no border, no shadow).
   *  - Scrolled: 95%-wide glass pill, max-w-7xl, rounded-full, mt-3 gap from
   *    the status bar, white/70 + backdrop-blur-lg + shadow-lg + 1px border.
   * `top` is overridden via [style.top] to clear the iOS safe-area inset
   * since the web equivalent sits at top-0 (no notch).
   */
  protected readonly headerClasses = computed(() => ({
    'fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out': true,
    'mt-3 w-[95%] max-w-7xl rounded-full bg-white/70 backdrop-blur-lg shadow-lg border border-white/20':
      this.scrolled(),
    'w-full bg-transparent': !this.scrolled(),
  }));

  /**
   * Inner nav classes — mirrors the web `mobileNavClasses()`. Layout is the
   * 3-zone flex; height collapses 80 -> 60px on scroll to match web exactly.
   */
  protected readonly navClasses = computed(() => ({
    'relative flex items-center justify-between px-8 transition-all duration-300': true,
    'h-[60px]': this.scrolled(),
    'h-[80px]': !this.scrolled(),
  }));

  /**
   * Top offset — replaces web's static `top-0` with the iOS safe-area inset
   * so the header content (status bar, then logo/title row) clears the notch.
   */
  protected readonly headerTop = 'env(safe-area-inset-top)';

  openSearch(): void {
    this.searchService.open();
  }

  goBack(): void {
    this.location.back();
  }
}
