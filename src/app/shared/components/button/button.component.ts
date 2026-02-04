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
        'flex w-full items-center justify-center gap-[5px] !rounded-full !px-4 !py-4 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant() === 'primary'
          ? 'bg-primary text-text-inverse hover:bg-primary-hover'
          : 'border border-black/10 bg-surface text-black hover:bg-background',
      ]"
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
  clicked = output();
}
