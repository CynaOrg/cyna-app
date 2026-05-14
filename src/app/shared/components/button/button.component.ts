import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  host: { class: 'block w-full' },
  template: `
    <button
      [type]="type()"
      [disabled]="isDisabled()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="clicked.emit()"
      [ngClass]="[
        'flex w-full items-center justify-center gap-2 !rounded-full !px-6 !py-3 text-[15px] !leading-normal font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        !color()
          ? variant() === 'primary'
            ? 'bg-primary text-text-inverse hover:bg-primary-hover'
            : 'border border-black/10 bg-surface text-black hover:bg-background'
          : 'text-text-inverse',
      ]"
      [style.background-color]="color() || null"
    >
      @if (loading()) {
        <span
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      } @else {
        <ng-content />
      }
      {{ label() }}
    </button>
  `,
})
export class ButtonComponent {
  label = input('');
  variant = input<'primary' | 'outline'>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  loading = input(false);
  color = input<string | undefined>(undefined);
  clicked = output();

  readonly isDisabled = computed(() => this.disabled() || this.loading());
}
