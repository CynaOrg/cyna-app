import { Directive, HostListener, inject, input } from '@angular/core';
import { HapticService } from '../services/haptic.service';

export type HapticLevel = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Adds haptic feedback to any clickable element.
 *
 * Usage: `<button appHapticOn="medium">…</button>`. The directive maps the
 * input value to the matching `HapticService` method; on web the underlying
 * service is a no-op so this is safe to leave on every interactive element.
 */
@Directive({
  selector: '[appHapticOn]',
  standalone: true,
})
export class HapticOnDirective {
  private readonly haptics = inject(HapticService);

  readonly appHapticOn = input<HapticLevel>('light');

  @HostListener('click')
  onClick(): void {
    // Fire-and-forget: never block the click handler chain on a haptic.
    switch (this.appHapticOn()) {
      case 'medium':
        void this.haptics.medium();
        break;
      case 'heavy':
        void this.haptics.heavy();
        break;
      case 'selection':
        void this.haptics.selection();
        break;
      case 'light':
      default:
        void this.haptics.light();
        break;
    }
  }
}
