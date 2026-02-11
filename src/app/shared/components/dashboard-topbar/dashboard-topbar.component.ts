import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorGlobe,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [RouterLink, NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorGlobe,
    }),
  ],
  template: `
    <div
      class="flex items-center justify-between border-b border-border-light bg-surface px-6 py-4 lg:px-8"
    >
      @if (title()) {
        <div>
          <h1 class="!m-0 text-xl font-bold text-text-primary">
            {{ title() | translate }}
          </h1>
          @if (subtitle()) {
            <p class="!m-0 mt-0.5 text-sm text-text-secondary">
              {{ subtitle() | translate }}
            </p>
          }
        </div>
      } @else {
        <div></div>
      }
      <div class="flex items-center gap-3">
        <!-- Search -->
        <button
          class="flex h-[38px] items-center gap-2 overflow-hidden rounded-full bg-[#f6f6f6] px-4 transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; border: none; cursor: pointer"
          (click)="openSearch()"
        >
          <ng-icon name="phosphorMagnifyingGlass" size="18" />
          <kbd
            class="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[11px] lg:inline-block"
            style="color: #9ca3af"
            >&#8984;K</kbd
          >
        </button>
        <!-- Language -->
        <button
          class="flex h-[38px] items-center gap-2 overflow-hidden rounded-full bg-[#f6f6f6] px-4 transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; border: none; cursor: pointer"
          (click)="toggleLanguage()"
        >
          <ng-icon name="phosphorGlobe" size="18" />
          <span class="text-xs font-semibold">{{
            currentLang() === 'fr' ? 'FR' : 'EN'
          }}</span>
        </button>
        <!-- Cart -->
        <a
          routerLink="/cart"
          class="relative flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; text-decoration: none"
        >
          <ng-icon name="phosphorShoppingCart" size="20" />
          @if (cartCount() > 0) {
            <span
              class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>
      </div>
    </div>
  `,
})
export class DashboardTopBarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  private readonly translate = inject(TranslateService);

  title = input<string>('');
  subtitle = input<string>('');

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );

  openSearch(): void {
    this.searchService.open();
  }

  toggleLanguage(): void {
    const newLang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
    document.cookie = `cyna_lang=${newLang};path=/;max-age=31536000;SameSite=Strict`;
  }
}
