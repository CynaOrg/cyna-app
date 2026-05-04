import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { HapticService } from '@core/native';

/**
 * Native-feel pull-to-refresh wrapper around `ion-refresher`.
 *
 * Drop this component (with `slot="fixed"` already wired internally) at
 * the top of any page that lives inside an `ion-content`. The host page
 * gets a `(refresh)` event, performs its async reload, and then asks the
 * component to terminate the spinner via the public `complete()` method.
 *
 * The component also fires a light haptic at the start of the refresh —
 * matches platform conventions on iOS.
 *
 * Usage:
 * ```html
 * <app-pull-to-refresh #r (refresh)="reload(r)" />
 * ```
 *
 * ```ts
 * async reload(r: PullToRefreshComponent) {
 *   await this.store.reload();
 *   await r.complete();
 * }
 * ```
 */
@Component({
  selector: 'app-pull-to-refresh',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-refresher
      #refresher
      slot="fixed"
      (ionRefresh)="onRefresh($event)"
    >
      <ion-refresher-content
        pullingIcon="chevron-down-circle-outline"
        refreshingSpinner="circles"
      ></ion-refresher-content>
    </ion-refresher>
  `,
})
export class PullToRefreshComponent {
  /**
   * Emitted when the user pulls down to refresh. The parent should run
   * its async reload and then call `complete()` on the host instance.
   */
  @Output() readonly refresh = new EventEmitter<void>();

  @ViewChild('refresher', { static: true })
  private readonly refresherRef!: ElementRef<HTMLIonRefresherElement>;

  private readonly haptics = inject(HapticService);

  protected onRefresh(_event: Event): void {
    void this.haptics.light();
    this.refresh.emit();
  }

  /**
   * Terminate the refreshing spinner. Idempotent — safe to call even if
   * the underlying `ion-refresher` was never triggered.
   */
  async complete(): Promise<void> {
    const el = this.refresherRef?.nativeElement;
    if (!el) {
      return;
    }
    try {
      await el.complete();
    } catch {
      // Fail silently — happens in tests where the ion element is a stub.
    }
  }
}
