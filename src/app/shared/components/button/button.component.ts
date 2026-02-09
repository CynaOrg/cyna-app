import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  host: { class: 'block w-full' },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="clicked.emit()"
      [ngClass]="[
        'flex w-full items-center justify-center gap-2 !rounded-full px-6 py-2.5 text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        !color()
          ? variant() === 'primary'
            ? 'bg-primary text-text-inverse hover:bg-primary-hover'
            : 'border border-black/10 bg-surface text-black hover:bg-background'
          : 'text-text-inverse',
      ]"
      [style.background-color]="color() || null"
    >
      <ng-content />
      {{ label() }}
    </button>
  `,
})
export class ButtonComponent {
  label = input('');
  variant = input<'primary' | 'outline'>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  color = input<string | undefined>(undefined);
  clicked = output();
}
