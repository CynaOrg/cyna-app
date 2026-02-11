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
  phosphorUser,
  phosphorSignOut,
  phosphorGlobe,
  phosphorList,
  phosphorX,
  phosphorHouse,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
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
    NgClass,
    CynaLogoComponent,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorSquaresFour,
      phosphorUser,
      phosphorSignOut,
      phosphorGlobe,
      phosphorList,
      phosphorX,
      phosphorHouse,
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

      <!-- Nav links -->
      <nav class="flex flex-1 flex-col gap-0.5 px-2 pt-1">
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
      <div class="flex flex-col gap-0.5 border-t border-border-light px-2 py-4">
        <a
          routerLink="/dashboard/account"
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

        <!-- Separator -->
        <div class="mx-2 my-1 border-t border-border-light"></div>

        <a
          class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
          style="color: #0a0a0a; cursor: pointer; text-decoration: none"
          [attr.aria-label]="'LANGUAGE.SWITCH' | translate"
          (click)="toggleLanguage()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'English' : 'Français' }}
        </a>

        <a
          class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-error"
          style="cursor: pointer; text-decoration: none"
          (click)="onLogout()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </a>
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
          routerLink="/dashboard/account"
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

        <a
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100"
          style="color: #ef4444; cursor: pointer; text-decoration: none"
          (click)="onLogout(); closeMobileMenu()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </a>

        <!-- Separator -->
        <div class="mx-3 my-3 border-t border-black/5"></div>

        <!-- Language toggle -->
        <a
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; cursor: pointer; text-decoration: none"
          (click)="toggleLanguage(); closeMobileMenu()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'English' : 'Français' }}
        </a>
      </div>
    </div>
  `,
})
export class DashboardSidebarComponent implements AfterViewInit {
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

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

  topLinks: SidebarLink[] = [
    {
      route: '/landing',
      labelKey: 'NAV.BACK_TO_STORE',
      icon: 'phosphorHouse',
    },
    {
      route: '/dashboard',
      labelKey: 'NAV.DASHBOARD',
      icon: 'phosphorSquaresFour',
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
