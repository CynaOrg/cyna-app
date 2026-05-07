import { Component, input, output } from '@angular/core';

/**
 * Custom checkbox control with a rounded square that fills with primary +
 * a white checkmark when checked. Replaces native `<input type="checkbox">`
 * whose accent-color rendering is unreliable on Capacitor WebViews
 * (renders as a black square on Android).
 *
 * Stateless: parent owns `checked` and reacts to `(checkedChange)`.
 */
@Component({
  selector: 'app-checkbox-toggle',
  standalone: true,
  template: `
    <label
      class="flex cursor-pointer select-none items-center gap-3"
      [class.opacity-50]="disabled()"
      [class.cursor-not-allowed]="disabled()"
    >
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="checkedChange.emit(!checked())"
        class="sr-only"
      />
      <span
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
        [class.border-border]="!checked()"
        [class.border-primary]="checked()"
        [class.bg-primary]="checked()"
      >
        @if (checked()) {
          <svg
            class="h-3 w-3 text-white"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 8l3 3 7-7" />
          </svg>
        }
      </span>
      @if (label()) {
        <span class="text-sm text-text-primary">{{ label() }}</span>
      }
    </label>
  `,
})
export class CheckboxToggleComponent {
  checked = input<boolean>(false);
  label = input<string>('');
  disabled = input<boolean>(false);

  checkedChange = output<boolean>();
}
