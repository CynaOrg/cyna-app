import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface CategoryCard {
  titleKey: string;
  descriptionKey: string;
  route: string;
  svg: string;
  image: string;
}

@Component({
  selector: 'app-category-cards',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block' },
  styles: `
    .feature-card {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      border-color: #e2e8f0;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
      transform: translateY(-4px);
    }
    .feature-card:hover .feature-img {
      transform: scale(1.03);
    }
    .feature-card:hover .feature-arrow {
      transform: translateX(4px);
      opacity: 1;
    }
  `,
  template: `
    <section class="w-full py-24" style="background: #f8fafc;">
      <div class="mx-auto max-w-7xl px-8">
        <!-- Section header -->
        <div class="mb-6 text-center">
          <span
            class="inline-flex items-center rounded-full border px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider"
            style="background: #ede9fe; border-color: #ddd6fe; color: #4f39f6; font-family: 'DM Sans', sans-serif;"
            >{{ 'CATEGORIES.LABEL' | translate }}</span
          >
        </div>
        <h2
          class="mb-4 text-center font-bold leading-tight"
          style="font-family: 'DM Sans', sans-serif; font-size: clamp(28px, 4vw, 44px); color: #0f172a;"
        >
          {{ 'CATEGORIES.TITLE' | translate }}
        </h2>
        <p
          class="mx-auto mb-16 max-w-2xl text-center leading-relaxed"
          style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #64748b;"
        >
          {{ 'CATEGORIES.SUBTITLE' | translate }}
        </p>

        <!-- Cards grid -->
        <div class="grid gap-6 md:grid-cols-3">
          @for (card of cards; track card.route; let i = $index) {
            <a
              [routerLink]="card.route"
              class="feature-card flex flex-col"
              style="text-decoration: none;"
            >
              <div class="overflow-hidden" style="background: #f8fafc;">
                <img
                  [src]="card.image"
                  [alt]="card.titleKey | translate"
                  class="feature-img h-48 w-full object-cover transition-transform duration-500"
                />
              </div>
              <div class="flex flex-1 flex-col p-6">
                <div class="mb-4 flex items-center gap-3">
                  <!-- Shield icon (Services) -->
                  @if (i === 0) {
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path
                        d="M14 2 L25 8 V16 C25 21 20 25 14 27 C8 25 3 21 3 16 V8 Z"
                        fill="#4f39f6"
                        opacity="0.12"
                      />
                      <path
                        d="M14 5 L23 9.5 V16 C23 20 19 23.5 14 25.5 C9 23.5 5 20 5 16 V9.5 Z"
                        stroke="#4f39f6"
                        stroke-width="1.8"
                        fill="none"
                      />
                      <path
                        d="M10 14.5 L13 17.5 L19 11.5"
                        stroke="#4f39f6"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                      />
                    </svg>
                  }
                  <!-- Key icon (Licenses) -->
                  @if (i === 1) {
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle
                        cx="18"
                        cy="10"
                        r="6"
                        fill="#4f39f6"
                        opacity="0.12"
                      />
                      <circle
                        cx="18"
                        cy="10"
                        r="4.5"
                        stroke="#4f39f6"
                        stroke-width="1.8"
                        fill="none"
                      />
                      <circle cx="18" cy="10" r="1.5" fill="#4f39f6" />
                      <path
                        d="M13.5 14 L5 22.5 V26 H9 V23.5 H11.5 V21 L13.8 18.7"
                        stroke="#4f39f6"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                      />
                    </svg>
                  }
                  <!-- Server icon (Products) -->
                  @if (i === 2) {
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect
                        x="3"
                        y="4"
                        width="22"
                        height="6"
                        rx="2"
                        fill="#4f39f6"
                        opacity="0.12"
                      />
                      <rect
                        x="3"
                        y="4"
                        width="22"
                        height="6"
                        rx="2"
                        stroke="#4f39f6"
                        stroke-width="1.8"
                        fill="none"
                      />
                      <circle cx="7" cy="7" r="1.2" fill="#4f39f6" />
                      <rect
                        x="3"
                        y="13"
                        width="22"
                        height="6"
                        rx="2"
                        stroke="#4f39f6"
                        stroke-width="1.8"
                        fill="none"
                      />
                      <circle cx="7" cy="16" r="1.2" fill="#4f39f6" />
                      <rect
                        x="3"
                        y="22"
                        width="22"
                        height="4"
                        rx="1.5"
                        fill="#4f39f6"
                        opacity="0.08"
                      />
                      <line
                        x1="16"
                        y1="7"
                        x2="21"
                        y2="7"
                        stroke="#4f39f6"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <line
                        x1="16"
                        y1="16"
                        x2="21"
                        y2="16"
                        stroke="#4f39f6"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  }
                  <h3
                    class="font-bold"
                    style="font-family: 'DM Sans', sans-serif; font-size: 18px; color: #0f172a;"
                  >
                    {{ card.titleKey | translate }}
                  </h3>
                </div>
                <p
                  class="mb-6 flex-1 leading-relaxed"
                  style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #64748b; line-height: 1.7;"
                >
                  {{ card.descriptionKey | translate }}
                </p>
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm font-semibold"
                    style="color: #4f39f6; font-family: 'DM Sans', sans-serif;"
                    >{{ 'CATEGORIES.EXPLORE' | translate }}</span
                  >
                  <svg
                    class="feature-arrow h-4 w-4 opacity-60 transition-all duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f39f6"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class CategoryCardsComponent {
  readonly cards: CategoryCard[] = [
    {
      titleKey: 'CATEGORIES.SERVICES_TITLE',
      descriptionKey: 'CATEGORIES.SERVICES_DESC',
      route: '/services',
      svg: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2 L25 8 V16 C25 21 20 25 14 27 C8 25 3 21 3 16 V8 Z" fill="#4f39f6" opacity="0.12"/>
        <path d="M14 5 L23 9.5 V16 C23 20 19 23.5 14 25.5 C9 23.5 5 20 5 16 V9.5 Z" stroke="#4f39f6" stroke-width="1.8" fill="none"/>
        <path d="M10 14.5 L13 17.5 L19 11.5" stroke="#4f39f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
      image: 'assets/images/landing/feature-monitoring.jpg',
    },
    {
      titleKey: 'CATEGORIES.LICENSES_TITLE',
      descriptionKey: 'CATEGORIES.LICENSES_DESC',
      route: '/licenses',
      svg: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="10" r="6" fill="#4f39f6" opacity="0.12"/>
        <circle cx="18" cy="10" r="4.5" stroke="#4f39f6" stroke-width="1.8" fill="none"/>
        <circle cx="18" cy="10" r="1.5" fill="#4f39f6"/>
        <path d="M13.5 14 L5 22.5 V26 H9 V23.5 H11.5 V21 L13.8 18.7" stroke="#4f39f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`,
      image: 'assets/images/landing/feature-analytics.jpg',
    },
    {
      titleKey: 'CATEGORIES.PRODUCTS_TITLE',
      descriptionKey: 'CATEGORIES.PRODUCTS_DESC',
      route: '/products',
      svg: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="22" height="6" rx="2" fill="#4f39f6" opacity="0.12"/>
        <rect x="3" y="4" width="22" height="6" rx="2" stroke="#4f39f6" stroke-width="1.8" fill="none"/>
        <circle cx="7" cy="7" r="1.2" fill="#4f39f6"/>
        <rect x="3" y="13" width="22" height="6" rx="2" stroke="#4f39f6" stroke-width="1.8" fill="none"/>
        <circle cx="7" cy="16" r="1.2" fill="#4f39f6"/>
        <rect x="3" y="22" width="22" height="4" rx="1.5" fill="#4f39f6" opacity="0.08"/>
        <line x1="16" y1="7" x2="21" y2="7" stroke="#4f39f6" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="16" y1="16" x2="21" y2="16" stroke="#4f39f6" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
      image: 'assets/images/landing/feature-team.jpg',
    },
  ];
}
