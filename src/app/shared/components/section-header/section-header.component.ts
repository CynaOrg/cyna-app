import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block w-full' },
  template: `
    @if (variant() === 'browser') {
      <div
        class="flex flex-col items-center gap-[10px] text-center tracking-[-0.2px]"
      >
        <h2
          class="font-semibold leading-normal"
          style="color: #0a0a0a; font-size: clamp(32px, 4vw, 48px)"
        >
          {{ title() }}
        </h2>
        @if (subtitle()) {
          <p
            class="font-normal leading-normal max-w-[700px]"
            style="color: #585858; font-size: clamp(12px, 1.5vw, 16px)"
          >
            {{ subtitle() }}
          </p>
        }
      </div>
    } @else {
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
  variant = input<'browser' | 'mobile'>('browser');
}
