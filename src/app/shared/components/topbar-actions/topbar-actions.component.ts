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
  selector: 'app-topbar-actions',
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
    <!-- Search -->
    <button
      class="flex h-[38px] items-center gap-2 overflow-hidden !rounded-full bg-[#f6f6f6] !px-5 transition-colors hover:bg-primary-light"
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
      class="flex h-[38px] items-center gap-2 overflow-hidden !rounded-full bg-[#f6f6f6] !px-5 transition-colors hover:bg-primary-light"
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
      [routerLink]="cartRoute()"
      class="relative flex h-[38px] w-[38px] items-center justify-center !rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
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
  `,
  host: { class: 'contents' },
})
export class TopbarActionsComponent {
  cartRoute = input<string>('/cart');
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  private readonly translate = inject(TranslateService);

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
