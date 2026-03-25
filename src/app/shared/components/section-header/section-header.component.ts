import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block w-full' },
  template: `
    @if (centered()) {
      <!-- Centered variant (for FAQ, etc.) -->
      <div class="flex flex-col items-center text-center w-full">
        <h2
          class="font-semibold leading-normal"
          style="color: #0a0a0a; font-size: clamp(28px, 3.5vw, 40px)"
        >
          {{ title() }}
        </h2>
      </div>
    } @else if (variant() === 'browser') {
      <!-- Browser: left title + right link -->
      <div class="flex items-center justify-between w-full">
        <h2
          class="font-semibold leading-normal"
          style="color: #0a0a0a; font-size: clamp(18px, 2vw, 22px)"
        >
          {{ title() }}
        </h2>
        @if (linkText() && linkRoute()) {
          <a
            [routerLink]="linkRoute()"
            class="flex items-center gap-1.5 font-medium transition-colors"
            style="color: #4f39f6; font-size: 14px"
          >
            {{ linkText() }}
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </a>
        }
      </div>
    } @else {
      <!-- Mobile -->
      <div class="flex items-center justify-between w-full">
        <h2
          class="font-semibold leading-normal"
          style="color: #0a0a0a; font-size: 16px"
        >
          {{ title() }}
        </h2>
        @if (linkText() && linkRoute()) {
          <a
            [routerLink]="linkRoute()"
            class="font-normal leading-normal"
            style="color: #4f39f6; font-size: 12px"
          >
            {{ linkText() }}
          </a>
        }
      </div>
    }
  `,
})
export class SectionHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  linkText = input<string>();
  linkRoute = input<string>();
  centered = input<boolean>(false);
  variant = input<'browser' | 'mobile'>('browser');
}
