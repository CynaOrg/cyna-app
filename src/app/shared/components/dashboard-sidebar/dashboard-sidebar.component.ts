import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorSquaresFour,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorKey,
  phosphorEnvelopeSimple,
  phosphorClipboardText,
  phosphorStorefront,
  phosphorGearSix,
  phosphorSignOut,
  phosphorGlobe,
  phosphorList,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { AuthStore } from '@core/stores/auth.store';

interface SidebarLink {
  route: string;
  labelKey: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    NgClass,
    CynaLogoComponent,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorSquaresFour,
      phosphorPackage,
      phosphorShieldCheck,
      phosphorKey,
      phosphorEnvelopeSimple,
      phosphorClipboardText,
      phosphorStorefront,
      phosphorGearSix,
      phosphorSignOut,
      phosphorGlobe,
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
        <a routerLink="/dashboard" style="text-decoration: none">
          <app-cyna-logo variant="full" color="#0A0A0A" />
        </a>
      </div>

      <!-- Main nav -->
      <nav class="flex flex-1 flex-col overflow-y-auto px-3">
        <!-- Dashboard link -->
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          #rlaDash="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: true }"
          class="mb-6 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          [class.bg-primary]="rlaDash.isActive"
          [style.color]="rlaDash.isActive ? '#ffffff' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorSquaresFour" size="20" />
          {{ 'SIDEBAR.DASHBOARD' | translate }}
        </a>

        <!-- CATALOGUE section -->
        <div class="mb-6">
          <span
            class="mb-2 block px-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
          >
            {{ 'SIDEBAR.CATALOGUE' | translate }}
          </span>
          @for (link of catalogueLinks; track link.route) {
            <a
              [routerLink]="link.route"
              routerLinkActive="active"
              #rlaCat="routerLinkActive"
              class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              [class.bg-primary-light]="rlaCat.isActive"
              [style.color]="rlaCat.isActive ? '#4f39f6' : '#585858'"
              style="text-decoration: none"
            >
              <ng-icon [name]="link.icon" size="20" />
              {{ link.labelKey | translate }}
            </a>
          }
        </div>

        <!-- GESTION section -->
        <div class="mb-6">
          <span
            class="mb-2 block px-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
          >
            {{ 'SIDEBAR.MANAGEMENT' | translate }}
          </span>
          @for (link of managementLinks; track link.route) {
            <a
              [routerLink]="link.route"
              routerLinkActive="active"
              #rlaMan="routerLinkActive"
              class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              [class.bg-primary-light]="rlaMan.isActive"
              [style.color]="rlaMan.isActive ? '#4f39f6' : '#585858'"
              style="text-decoration: none"
            >
              <ng-icon [name]="link.icon" size="20" />
              {{ link.labelKey | translate }}
            </a>
          }
        </div>
      </nav>

      <!-- Boutique link -->
      <div class="border-t border-border-light px-3 py-3">
        <a
          routerLink="/landing"
          class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorStorefront" size="20" />
          {{ 'SIDEBAR.STORE' | translate }}
        </a>
      </div>

      <!-- User profile -->
      <div class="border-t border-border-light px-3 py-3">
        <div class="flex items-center gap-3 px-2">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
          >
            {{ userInitials() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="!m-0 truncate text-sm font-medium text-text-primary">
              {{ userDisplayName() }}
            </p>
            <p class="!m-0 truncate text-xs text-text-muted">
              {{ user()?.email }}
            </p>
          </div>
          <a
            routerLink="/dashboard/account"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            style="text-decoration: none"
          >
            <ng-icon name="phosphorGearSix" size="18" />
          </a>
        </div>
      </div>
    </aside>

    <!-- ========== MOBILE TOP HEADER (<lg) ========== -->
    <header [ngClass]="mobileHeaderClasses()">
      <nav [ngClass]="mobileHeaderNavClasses()">
        <a
          routerLink="/dashboard"
          class="shrink-0"
          style="text-decoration: none"
        >
          <app-cyna-logo variant="mark" color="#0A0A0A" />
        </a>
        <div class="flex items-center gap-2">
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
      </nav>
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
      <nav class="flex flex-1 flex-col overflow-y-auto px-3">
        <!-- Dashboard -->
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          #rlaPanelDash="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: true }"
          class="mb-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary]="rlaPanelDash.isActive"
          [style.color]="rlaPanelDash.isActive ? '#ffffff' : '#0a0a0a'"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorSquaresFour" size="20" />
          {{ 'SIDEBAR.DASHBOARD' | translate }}
        </a>

        <!-- CATALOGUE -->
        <span
          class="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
        >
          {{ 'SIDEBAR.CATALOGUE' | translate }}
        </span>
        @for (link of catalogueLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rlaPanelCat="routerLinkActive"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaPanelCat.isActive"
            [style.color]="rlaPanelCat.isActive ? '#4f39f6' : '#585858'"
            style="text-decoration: none"
            (click)="closeMobileMenu()"
          >
            <ng-icon [name]="link.icon" size="20" />
            {{ link.labelKey | translate }}
          </a>
        }

        <!-- GESTION -->
        <span
          class="mb-2 mt-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
        >
          {{ 'SIDEBAR.MANAGEMENT' | translate }}
        </span>
        @for (link of managementLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rlaPanelMan="routerLinkActive"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaPanelMan.isActive"
            [style.color]="rlaPanelMan.isActive ? '#4f39f6' : '#585858'"
            style="text-decoration: none"
            (click)="closeMobileMenu()"
          >
            <ng-icon [name]="link.icon" size="20" />
            {{ link.labelKey | translate }}
          </a>
        }
      </nav>

      <!-- Bottom section -->
      <div class="border-t border-border-light px-3 py-3">
        <!-- Boutique -->
        <a
          routerLink="/landing"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
          style="text-decoration: none"
          (click)="closeMobileMenu()"
        >
          <ng-icon name="phosphorStorefront" size="20" />
          {{ 'SIDEBAR.STORE' | translate }}
        </a>
      </div>

      <!-- User profile + actions -->
      <div class="border-t border-border-light px-3 py-3">
        <!-- User info -->
        <div class="mb-3 flex items-center gap-3 px-2">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
          >
            {{ userInitials() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="!m-0 truncate text-sm font-medium text-text-primary">
              {{ userDisplayName() }}
            </p>
            <p class="!m-0 truncate text-xs text-text-muted">
              {{ user()?.email }}
            </p>
          </div>
        </div>

        <!-- Language toggle -->
        <a
          class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
          style="color: #0a0a0a; cursor: pointer; text-decoration: none"
          (click)="toggleLanguage(); closeMobileMenu()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'English' : 'Francais' }}
        </a>

        <!-- Logout -->
        <a
          class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-error"
          style="cursor: pointer; text-decoration: none"
          (click)="onLogout(); closeMobileMenu()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </a>
      </div>
    </div>
  `,
})
export class DashboardSidebarComponent implements AfterViewInit {
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  user = toSignal(this.authStore.user$, { initialValue: null });

  userInitials = computed(() => {
    const u = this.user();
    if (!u) return '';
    return (
      (u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')
    ).toUpperCase();
  });

  userDisplayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName} ${u.lastName?.charAt(0) || ''}.`;
  });

  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );
  menuOpen = signal(false);
  scrolled = signal(false);

  mobileHeaderClasses = computed(() => ({
    'fixed top-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-in-out lg:hidden': true,
    'mt-3 w-[95%] max-w-7xl rounded-full bg-white/70 backdrop-blur-lg shadow-lg border border-white/20':
      this.scrolled(),
    'w-full bg-transparent': !this.scrolled(),
  }));

  mobileHeaderNavClasses = computed(() => ({
    'flex items-center justify-between px-8 transition-all duration-300': true,
    'h-[60px]': this.scrolled(),
    'h-[80px]': !this.scrolled(),
  }));

  catalogueLinks: SidebarLink[] = [
    {
      route: '/products',
      labelKey: 'SIDEBAR.PRODUCTS',
      icon: 'phosphorPackage',
    },
    {
      route: '/services',
      labelKey: 'SIDEBAR.SERVICES',
      icon: 'phosphorShieldCheck',
    },
    {
      route: '/licenses',
      labelKey: 'SIDEBAR.LICENSES',
      icon: 'phosphorKey',
    },
  ];

  managementLinks: SidebarLink[] = [
    {
      route: '/dashboard/subscriptions',
      labelKey: 'SIDEBAR.SUBSCRIPTIONS',
      icon: 'phosphorEnvelopeSimple',
    },
    {
      route: '/dashboard/orders',
      labelKey: 'SIDEBAR.ORDERS',
      icon: 'phosphorClipboardText',
    },
  ];

  ngAfterViewInit() {
    this.setupScrollDetection();
  }

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

  private setupScrollDetection() {
    const scrollHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.scrolled.set((detail?.scrollTop ?? 0) > 50);
    };

    const attachToContent = () => {
      document.querySelectorAll('ion-content').forEach((el: any) => {
        if (!el._sidebarScrollBound) {
          el._sidebarScrollBound = true;
          el.scrollEvents = true;
          el.addEventListener('ionScroll', scrollHandler);
        }
      });
    };

    setTimeout(attachToContent, 300);

    const observer = new MutationObserver(() => {
      this.scrolled.set(false);
      setTimeout(attachToContent, 300);
    });

    const outlet = document.querySelector('ion-router-outlet');
    if (outlet) {
      observer.observe(outlet, { childList: true, subtree: true });
    }

    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
