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
      class="flex h-[38px] items-center gap-2 overflow-hidden !rounded-full !px-5 transition-colors"
      [style.background]="bgColor()"
      [style.color]="fgColor()"
      style="border: none; cursor: pointer"
      (click)="openSearch()"
    >
      <ng-icon name="phosphorMagnifyingGlass" size="18" />
      <kbd
        class="hidden rounded border px-1.5 py-0.5 text-[11px] lg:inline-block"
        [style.border-color]="
          invertColors() ? 'rgba(255,255,255,0.15)' : '#e5e5e5'
        "
        [style.color]="invertColors() ? '#a1a1aa' : '#9ca3af'"
        [style.background]="
          invertColors() ? 'rgba(255,255,255,0.05)' : '#f9f9f9'
        "
        >&#8984;K</kbd
      >
    </button>
    <!-- Language -->
    <button
      class="flex h-[38px] items-center gap-2 overflow-hidden !rounded-full !px-5 transition-colors"
      [style.background]="bgColor()"
      [style.color]="fgColor()"
      style="border: none; cursor: pointer"
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
      class="relative flex h-[38px] w-[38px] items-center justify-center !rounded-full transition-colors"
      [style.background]="bgColor()"
      [style.color]="fgColor()"
      style="text-decoration: none"
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
  invertColors = input<boolean>(false);
  private readonly cartStore = inject(CartStore);
  private readonly searchService = inject(SearchService);
  private readonly translate = inject(TranslateService);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );

  bgColor = () => (this.invertColors() ? 'rgba(255,255,255,0.1)' : '#f6f6f6');
  fgColor = () => (this.invertColors() ? '#fafafa' : '#0a0a0a');

  openSearch(): void {
    this.searchService.open();
  }

  toggleLanguage(): void {
    const newLang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
    document.cookie = `cyna_lang=${newLang};path=/;max-age=31536000;Secure;SameSite=Strict`;
  }
}
