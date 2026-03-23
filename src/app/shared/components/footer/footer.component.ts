import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';

interface FooterLink {
  labelKey: string;
  route: string;
}

interface SocialLink {
  name: string;
  url: string;
  svgPath: string;
  viewBox: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule, CynaLogoComponent],
  template: `
    <footer class="w-full bg-[#4f39f6] text-white">
      <div class="mx-auto max-w-7xl px-8 py-16">
        <!-- Top section: Logo + columns -->
        <div
          class="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-8"
        >
          <!-- Logo + tagline -->
          <div class="flex flex-col gap-4 lg:max-w-xs">
            <a routerLink="/landing" class="no-underline">
              <app-cyna-logo variant="full" color="#ffffff" />
            </a>
            <p class="text-sm leading-relaxed text-white/70">
              {{ 'FOOTER.TAGLINE' | translate }}
            </p>
          </div>

          <!-- Navigation columns -->
          <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:gap-16">
            <!-- Navigation -->
            <div class="flex flex-col gap-3">
              <h3
                class="text-sm font-semibold uppercase tracking-wider text-white/70"
              >
                {{ 'FOOTER.NAV_TITLE' | translate }}
              </h3>
              <ul class="flex flex-col gap-2">
                @for (link of navLinks; track link.route) {
                  <li>
                    <a
                      [routerLink]="link.route"
                      class="no-underline text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {{ link.labelKey | translate }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <!-- Legal -->
            <div class="flex flex-col gap-3">
              <h3
                class="text-sm font-semibold uppercase tracking-wider text-white/70"
              >
                {{ 'FOOTER.LEGAL_TITLE' | translate }}
              </h3>
              <ul class="flex flex-col gap-2">
                @for (link of legalLinks; track link.route) {
                  <li>
                    <a
                      [routerLink]="link.route"
                      class="no-underline text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {{ link.labelKey | translate }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <!-- Social -->
            <div class="flex flex-col gap-3">
              <h3
                class="text-sm font-semibold uppercase tracking-wider text-white/70"
              >
                {{ 'FOOTER.SOCIAL_TITLE' | translate }}
              </h3>
              <div class="flex gap-3">
                @for (social of socialLinks; track social.name) {
                  <a
                    [href]="social.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
                    [attr.aria-label]="social.name"
                  >
                    <svg
                      class="h-4 w-4 fill-current text-white"
                      [attr.viewBox]="social.viewBox"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path [attr.d]="social.svgPath" />
                    </svg>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div
          class="mt-12 flex flex-col items-center gap-4 border-t border-white/20 pt-8 sm:flex-row sm:justify-between"
        >
          <p class="text-sm text-white/60">
            {{ 'FOOTER.COPYRIGHT' | translate }}
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly navLinks: FooterLink[] = [
    { labelKey: 'NAV.PRODUCTS', route: '/products' },
    { labelKey: 'NAV.SERVICES', route: '/services' },
    { labelKey: 'NAV.LICENSES', route: '/licenses' },
    { labelKey: 'NAV.CONTACT', route: '/contact' },
  ];

  readonly legalLinks: FooterLink[] = [
    { labelKey: 'FOOTER.LEGAL_NOTICES', route: '/legal/mentions' },
    { labelKey: 'FOOTER.TERMS', route: '/legal/cgu' },
    { labelKey: 'FOOTER.PRIVACY', route: '/legal/privacy' },
  ];

  readonly socialLinks: SocialLink[] = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      viewBox: '0 0 24 24',
      svgPath:
        'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
      name: 'X',
      url: 'https://x.com',
      viewBox: '0 0 24 24',
      svgPath:
        'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      viewBox: '0 0 24 24',
      svgPath:
        'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
  ];
}
