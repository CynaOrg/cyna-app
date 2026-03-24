import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trusted-by',
  standalone: true,
  imports: [TranslateModule],
  host: { class: 'block' },
  template: `
    <section
      class="w-full py-16"
      style="background: #ffffff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;"
    >
      <div class="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-8 md:grid-cols-4">
        <!-- Entreprises -->
        <div class="flex flex-col items-center gap-3 text-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="8" width="24" height="22" rx="3" fill="#ede9fe" />
            <rect x="10" y="4" width="16" height="26" rx="2" fill="#4f39f6" />
            <rect
              x="14"
              y="9"
              width="3"
              height="3"
              rx="0.75"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="19"
              y="9"
              width="3"
              height="3"
              rx="0.75"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="14"
              y="15"
              width="3"
              height="3"
              rx="0.75"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="19"
              y="15"
              width="3"
              height="3"
              rx="0.75"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect x="15" y="23" width="6" height="7" rx="1" fill="#ffffff" />
          </svg>
          <span
            class="font-bold tracking-tight"
            style="font-family: 'DM Sans', sans-serif; font-size: 32px; color: #0f172a;"
            >{{ 'STATS.ENTERPRISES_VALUE' | translate }}</span
          >
          <span
            class="text-sm"
            style="color: #94a3b8; font-family: 'DM Sans', sans-serif;"
            >{{ 'STATS.ENTERPRISES_LABEL' | translate }}</span
          >
        </div>

        <!-- Uptime -->
        <div class="flex flex-col items-center gap-3 text-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" fill="#ede9fe" />
            <circle cx="18" cy="18" r="10" fill="#4f39f6" />
            <polyline
              points="13,19 17,23 24,14"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
          <span
            class="font-bold tracking-tight"
            style="font-family: 'DM Sans', sans-serif; font-size: 32px; color: #0f172a;"
            >{{ 'STATS.UPTIME_VALUE' | translate }}</span
          >
          <span
            class="text-sm"
            style="color: #94a3b8; font-family: 'DM Sans', sans-serif;"
            >{{ 'STATS.UPTIME_LABEL' | translate }}</span
          >
        </div>

        <!-- Support -->
        <div class="flex flex-col items-center gap-3 text-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="10" width="28" height="18" rx="9" fill="#ede9fe" />
            <rect x="7" y="12" width="22" height="14" rx="7" fill="#4f39f6" />
            <circle cx="14" cy="19" r="2" fill="#ffffff" />
            <circle cx="22" cy="19" r="2" fill="#ffffff" />
            <path
              d="M15.5 23 C16.5 24.5 19.5 24.5 20.5 23"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
          <span
            class="font-bold tracking-tight"
            style="font-family: 'DM Sans', sans-serif; font-size: 32px; color: #0f172a;"
            >{{ 'STATS.SUPPORT_VALUE' | translate }}</span
          >
          <span
            class="text-sm"
            style="color: #94a3b8; font-family: 'DM Sans', sans-serif;"
            >{{ 'STATS.SUPPORT_LABEL' | translate }}</span
          >
        </div>

        <!-- Solutions -->
        <div class="flex flex-col items-center gap-3 text-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M18 3 L30 10 L30 22 C30 27 24 32 18 34 C12 32 6 27 6 22 L6 10 Z"
              fill="#ede9fe"
            />
            <path
              d="M18 7 L27 12 L27 21 C27 25 22 29 18 31 C14 29 9 25 9 21 L9 12 Z"
              fill="#4f39f6"
            />
            <path
              d="M14 18 L17 21 L23 15"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
          <span
            class="font-bold tracking-tight"
            style="font-family: 'DM Sans', sans-serif; font-size: 32px; color: #0f172a;"
            >{{ 'STATS.SOLUTIONS_VALUE' | translate }}</span
          >
          <span
            class="text-sm"
            style="color: #94a3b8; font-family: 'DM Sans', sans-serif;"
            >{{ 'STATS.SOLUTIONS_LABEL' | translate }}</span
          >
        </div>
      </div>
    </section>
  `,
})
export class TrustedByComponent {}
