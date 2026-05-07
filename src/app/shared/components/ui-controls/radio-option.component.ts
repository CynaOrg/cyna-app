import { Component, input, output } from '@angular/core';

/**
 * Custom radio control with a soft circular ring + violet dot when selected.
 * Replaces native `<input type="radio">` whose accent-color rendering is
 * unreliable on Capacitor WebViews (renders as a black square on Android).
 *
 * Use as a single-row label with [name] grouping like a native radio:
 *   <app-radio-option [name]="'lang'" [checked]="lang === 'fr'"
 *                     label="Français" (selected)="lang = 'fr'" />
 */
@Component({
  selector: 'app-radio-option',
  standalone: true,
  template: `
    <label
      class="flex cursor-pointer select-none items-center gap-3"
      [class.opacity-50]="disabled()"
      [class.cursor-not-allowed]="disabled()"
    >
      <input
        type="radio"
        [name]="name()"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="selected.emit()"
        class="sr-only"
      />
      <span
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        [class.border-border]="!checked()"
        [class.border-primary]="checked()"
      >
        @if (checked()) {
          <span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
        }
      </span>
      @if (label()) {
        <span class="text-sm text-text-primary">{{ label() }}</span>
      }
    </label>
  `,
})
export class RadioOptionComponent {
  name = input.required<string>();
  checked = input<boolean>(false);
  label = input<string>('');
  disabled = input<boolean>(false);

  selected = output<void>();
}
