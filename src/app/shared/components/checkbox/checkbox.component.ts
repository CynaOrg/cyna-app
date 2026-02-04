import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="flex items-center gap-[5px] cursor-pointer"
      (click)="toggle()"
    >
      <div
        role="checkbox"
        [attr.aria-checked]="checked()"
        [ngClass]="[
          'flex size-3 shrink-0 items-center justify-center rounded-[2px] border border-solid border-black transition-colors',
          checked() ? '!bg-primary !border-primary' : 'bg-surface',
        ]"
      >
        @if (checked()) {
          <svg class="size-2" viewBox="0 0 8 8" fill="none">
            <path
              d="M1.5 4L3 5.5L6.5 2"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      </div>
      <span class="text-xs text-black select-none">{{ label() }}</span>
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  label = input('');

  checked = signal(false);

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  toggle() {
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
