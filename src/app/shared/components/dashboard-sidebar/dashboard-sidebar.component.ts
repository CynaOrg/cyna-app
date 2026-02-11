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
  phosphorMagnifyingGlass,
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
      phosphorMagnifyingGlass,
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
      <nav class="flex flex-1 flex-col gap-0.5 px-2 pt-2">
        @for (link of topLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
            class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
      <div class="flex flex-col border-t border-border-light px-2 py-4">
        <!-- Contact & Cart -->
        <div class="flex flex-col gap-0.5">
          <a
            routerLink="/contact"
            routerLinkActive="active"
            #rlaContact="routerLinkActive"
            class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
            class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
        </div>

        <!-- Separator -->
        <div class="mx-2 my-2 border-t border-border-light"></div>

        <!-- Language, Account, Logout -->
        <div class="flex flex-col gap-0.5">
          <button
            class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
            style="color: #0a0a0a; cursor: pointer"
            [attr.aria-label]="'LANGUAGE.SWITCH' | translate"
            (click)="toggleLanguage()"
          >
            <ng-icon name="phosphorGlobe" size="20" />
            {{ currentLang() === 'fr' ? 'English' : 'Français' }}
          </button>

          <a
            routerLink="/account"
            routerLinkActive="active"
            #rlaAccount="routerLinkActive"
            class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaAccount.isActive"
            [style.color]="rlaAccount.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none"
          >
            <ng-icon name="phosphorUser" size="20" />
            {{ 'NAV.MY_ACCOUNT' | translate }}
          </a>

          <button
            class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-error"
            style="cursor: pointer"
            (click)="onLogout()"
          >
            <ng-icon name="phosphorSignOut" size="20" />
            {{ 'NAV.LOGOUT' | translate }}
          </button>
        </div>
      </div>
    </aside>

    <!-- ========== MOBILE TOP HEADER (<lg) ========== -->
    <header
      class="fixed top-0 left-0 right-0 z-40 flex h-[80px] items-center justify-between bg-surface px-8 lg:hidden"
    >
      <a routerLink="/landing" class="shrink-0" style="text-decoration: none">
        <app-cyna-logo variant="mark" color="#0A0A0A" />
      </a>
      <div class="flex items-center gap-2">
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full border-none bg-[#f6f6f6]"
          style="color: #0a0a0a; cursor: pointer"
          [attr.aria-label]="'NAV.SEARCH' | translate"
        >
          <ng-icon name="phosphorMagnifyingGlass" size="20" />
        </button>
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full border-none bg-[#f6f6f6]"
          style="color: #0a0a0a; cursor: pointer"
          [attr.aria-label]="
            menuOpen()
              ? ('NAV.CLOSE_MENU' | translate)
              : ('NAV.OPEN_MENU' | translate)
          "
          (click)="menuOpen() ? closeMobileMenu() : openMobileMenu()"
        >
          <ng-icon
            [name]="menuOpen() ? 'phosphorX' : 'phosphorList'"
            size="22"
          />
        </button>
      </div>
    </header>

    <!-- ========== MOBILE SLIDE-OUT BACKDROP ========== -->
    <div
      class="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden"
      [class.opacity-0]="!menuOpen()"
      [class.pointer-events-none]="!menuOpen()"
      (click)="closeMobileMenu()"
    ></div>

    <!-- ========== MOBILE SLIDE-OUT PANEL ========== -->
    <div
      class="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-lg transition-transform duration-300 ease-in-out lg:hidden"
      [class.translate-x-0]="menuOpen()"
      [class.translate-x-full]="!menuOpen()"
    >
      <!-- Panel header -->
      <div class="flex h-[80px] items-center justify-between px-8">
        <span class="text-sm font-semibold" style="color: #0a0a0a">
          {{ 'NAV.MENU' | translate }}
        </span>
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full border-none bg-[#f6f6f6]"
          style="color: #0a0a0a; cursor: pointer"
          [attr.aria-label]="'NAV.CLOSE_MENU' | translate"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorX" size="22" />
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        @for (link of topLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rlaPanel="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
            class="block rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaPanel.isActive"
            [style.color]="rlaPanel.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none"
            (click)="closeMobileMenu()"
          >
            {{ link.labelKey | translate }}
          </a>
        }
      </nav>

      <!-- Separator -->
      <div class="mx-3 my-3 border-t border-black/5"></div>

      <!-- Bottom section -->
      <div class="flex flex-col gap-1 px-3 pb-6">
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
              class="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] font-bold text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>

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
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100"
          style="color: #ef4444; cursor: pointer"
          (click)="onLogout(); closeMobileMenu()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </button>

        <!-- Separator -->
        <div class="mx-3 my-3 border-t border-black/5"></div>

        <!-- Language toggle -->
        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; cursor: pointer"
          (click)="toggleLanguage(); closeMobileMenu()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'English' : 'Français' }}
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
