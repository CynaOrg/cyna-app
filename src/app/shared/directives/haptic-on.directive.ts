import { Directive, HostListener, Input, inject } from '@angular/core';
import { HapticService } from '@core/native';

export type HapticLevel = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Triggers a haptic feedback impulse on click. Fail-silent on web (the
 * underlying `HapticService` already guards against non-native shells).
 *
 * Selector follows the Angular ESLint `app` prefix convention
 * (`[appHapticOn]`), but the input alias `hapticOn` keeps the consumer
 * markup short and ergonomic.
 *
 * Usage:
 * ```html
 * <button appHapticOn="medium" (click)="addToCart()">Ajouter au panier</button>
 * <ion-button appHapticOn="light" (click)="toggle()">...</ion-button>
 * ```
 *
 * Levels:
 * - `light`: micro-confirmations (toggle, tab change). Default.
 * - `medium`: standard CTA / button taps.
 * - `heavy`: destructive actions, big confirmations.
 * - `selection`: picker scrolls / segmented control changes.
 */
@Directive({
  selector: '[appHapticOn]',
  standalone: true,
})
export class HapticOnDirective {
  private readonly haptics = inject(HapticService);

  /**
   * Haptic intensity to fire on click. `light` by default — keeps things
   * subtle when the directive is dropped on an element without any extra
   * configuration. Bound via the directive selector itself, so consumers
   * write `appHapticOn="medium"` (no extra attribute).
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('appHapticOn') level: HapticLevel | '' = 'light';

  @HostListener('click')
  protected onClick(): void {
    // Intentionally fire-and-forget. Errors are already swallowed inside
    // the service so we never want to block the click handler chain.
    void this.trigger();
  }

  private async trigger(): Promise<void> {
    // Empty string happens when the directive is used without a value
    // (`<button appHapticOn>...`) — fall back to `light`.
    const level: HapticLevel = this.level === '' ? 'light' : this.level;
    switch (level) {
      case 'medium':
        await this.haptics.medium();
        return;
      case 'heavy':
        await this.haptics.heavy();
        return;
      case 'selection':
        await this.haptics.selection();
        return;
      case 'light':
      default:
        await this.haptics.light();
        return;
    }
  }
}
