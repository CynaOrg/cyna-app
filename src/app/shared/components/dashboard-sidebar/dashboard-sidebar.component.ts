import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorSquaresFour,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorCertificate,
  phosphorShoppingCart,
  phosphorUser,
  phosphorSignOut,
  phosphorGlobe,
  phosphorEnvelope,
  phosphorList,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface SidebarLink {
  route: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    CynaLogoComponent,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorSquaresFour,
      phosphorPackage,
      phosphorShieldCheck,
      phosphorCertificate,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignOut,
      phosphorGlobe,
      phosphorEnvelope,
      phosphorList,
      phosphorX,
    }),
  ],
  template: `
    <!-- ========== DESKTOP SIDEBAR (lg+) ========== -->
    <aside
      class="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-border-light bg-surface"
    >
      <!-- Logo -->
      <div class="flex h-20 items-center px-6">
        <a routerLink="/landing" style="text-decoration: none">
          <app-cyna-logo variant="full" color="#0A0A0A" />
        </a>
      </div>

      <!-- Nav links -->
      <nav class="flex flex-1 flex-col gap-1 px-3 pt-2">
        @for (link of topLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rla.isActive"
            [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none"
          >
            <ng-icon [name]="link.icon" size="20" />
            {{ link.labelKey | translate }}
          </a>
        }
      </nav>

      <!-- Bottom section -->
      <div class="flex flex-col gap-1 border-t border-border-light px-3 py-4">
        <a
          routerLink="/contact"
          routerLinkActive="active"
          #rlaContact="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaContact.isActive"
          [style.color]="rlaContact.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorEnvelope" size="20" />
          {{ 'NAV.CONTACT' | translate }}
        </a>

        <a
          routerLink="/cart"
          routerLinkActive="active"
          #rlaCart="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaCart.isActive"
          [style.color]="rlaCart.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorShoppingCart" size="20" />
          {{ 'NAV.CART' | translate }}
          @if (cartCount() > 0) {
            <span
              class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>

        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; cursor: pointer"
          [attr.aria-label]="'LANGUAGE.SWITCH' | translate"
          (click)="toggleLanguage()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'Francais' : 'English' }}
          <span
            class="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {{ currentLang() === 'fr' ? 'FR' : 'EN' }}
          </span>
        </button>

        <a
          routerLink="/account"
          routerLinkActive="active"
          #rlaAccount="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaAccount.isActive"
          [style.color]="rlaAccount.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorUser" size="20" />
          {{ 'NAV.MY_ACCOUNT' | translate }}
        </a>

        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-error-light"
          style="color: #ff383c; cursor: pointer"
          (click)="onLogout()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </button>
      </div>
    </aside>

    <!-- ========== MOBILE BOTTOM NAV (<lg) ========== -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border-light bg-surface lg:hidden"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    >
      @for (link of bottomLinks; track link.route) {
        <a
          [routerLink]="link.route"
          routerLinkActive="active"
          #rlaBot="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
          class="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors"
          [style.color]="rlaBot.isActive ? '#4f39f6' : '#9ca3af'"
          style="text-decoration: none"
          [class.bg-primary-light]="rlaBot.isActive"
        >
          <ng-icon [name]="link.icon" size="22" />
          <span class="text-[10px] font-medium leading-tight">{{
            link.labelKey | translate
          }}</span>
        </a>
      }

      <!-- More button -->
      <button
        class="relative flex flex-1 flex-col items-center gap-0.5 border-none bg-transparent py-2.5 transition-colors"
        style="color: #9ca3af; cursor: pointer"
        (click)="openMobileMenu()"
      >
        <ng-icon name="phosphorList" size="22" />
        <span class="text-[10px] font-medium leading-tight">{{
          'NAV.MENU' | translate
        }}</span>
        @if (cartCount() > 0) {
          <span
            class="absolute right-1/4 top-1.5 h-2 w-2 rounded-full bg-primary"
          ></span>
        }
      </button>
    </nav>

    <!-- ========== MOBILE SLIDE-OUT BACKDROP ========== -->
    <div
      class="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden"
      [class.opacity-0]="!menuOpen()"
      [class.pointer-events-none]="!menuOpen()"
      (click)="closeMobileMenu()"
    ></div>

    <!-- ========== MOBILE SLIDE-OUT PANEL ========== -->
    <div
      class="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden"
      [class.translate-x-0]="menuOpen()"
      [class.translate-x-full]="!menuOpen()"
    >
      <!-- Header -->
      <div class="flex h-16 items-center justify-between px-5">
        <a
          routerLink="/landing"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <app-cyna-logo variant="mark" color="#0A0A0A" height="28" />
        </a>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full border-none bg-background transition-colors"
          style="color: #0a0a0a; cursor: pointer"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorX" size="18" />
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-1">
        @for (link of topLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rlaPanel="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaPanel.isActive"
            [style.color]="rlaPanel.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none"
            (click)="closeMobileMenu()"
          >
            <ng-icon [name]="link.icon" size="20" />
            {{ link.labelKey | translate }}
          </a>
        }
      </nav>

      <!-- Bottom section -->
      <div class="flex flex-col gap-0.5 border-t border-border-light px-3 py-3">
        <a
          routerLink="/contact"
          routerLinkActive="active"
          #rlaPanelContact="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaPanelContact.isActive"
          [style.color]="rlaPanelContact.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorEnvelope" size="20" />
          {{ 'NAV.CONTACT' | translate }}
        </a>

        <a
          routerLink="/cart"
          routerLinkActive="active"
          #rlaPanelCart="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaPanelCart.isActive"
          [style.color]="rlaPanelCart.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorShoppingCart" size="20" />
          {{ 'NAV.CART' | translate }}
          @if (cartCount() > 0) {
            <span
              class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>

        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; cursor: pointer"
          (click)="toggleLanguage()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'Francais' : 'English' }}
          <span
            class="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {{ currentLang() === 'fr' ? 'FR' : 'EN' }}
          </span>
        </button>

        <a
          routerLink="/account"
          routerLinkActive="active"
          #rlaPanelAccount="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaPanelAccount.isActive"
          [style.color]="rlaPanelAccount.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorUser" size="20" />
          {{ 'NAV.MY_ACCOUNT' | translate }}
        </a>

        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-error-light"
          style="color: #ff383c; cursor: pointer"
          (click)="onLogout(); closeMobileMenu()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class DashboardSidebarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );

  menuOpen = signal(false);

  topLinks: SidebarLink[] = [
    {
      route: '/dashboard',
      labelKey: 'NAV.DASHBOARD',
      icon: 'phosphorSquaresFour',
    },
    { route: '/products', labelKey: 'NAV.PRODUCTS', icon: 'phosphorPackage' },
    {
      route: '/services',
      labelKey: 'NAV.SERVICES',
      icon: 'phosphorShieldCheck',
    },
    {
      route: '/licenses',
      labelKey: 'NAV.LICENSES',
      icon: 'phosphorCertificate',
    },
  ];

  bottomLinks: SidebarLink[] = [
    {
      route: '/dashboard',
      labelKey: 'NAV.DASHBOARD',
      icon: 'phosphorSquaresFour',
    },
    { route: '/products', labelKey: 'NAV.PRODUCTS', icon: 'phosphorPackage' },
    {
      route: '/services',
      labelKey: 'NAV.SERVICES',
      icon: 'phosphorShieldCheck',
    },
    {
      route: '/licenses',
      labelKey: 'NAV.LICENSES',
      icon: 'phosphorCertificate',
    },
  ];

  openMobileMenu(): void {
    this.menuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.menuOpen.set(false);
  }

  onLogout(): void {
    this.authStore.logout();
  }

  toggleLanguage(): void {
    const newLang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
    document.cookie = `cyna_lang=${newLang};path=/;max-age=31536000;SameSite=Strict`;
  }
}
