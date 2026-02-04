import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  host: { class: 'block w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-2.5 w-full">
      @if (label()) {
        <label class="text-sm font-normal text-black">
          {{ label() }}
        </label>
      }
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="h-14 w-full rounded-full border border-black/10 bg-surface px-5 text-xs text-text-primary placeholder:text-[#828282] outline-none transition-colors focus:border-primary"
      />
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  label = input('');
  type = input<'text' | 'email' | 'password'>('text');
  placeholder = input('');

  value = signal('');
  disabled = signal(false);

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
