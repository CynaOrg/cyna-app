import { Component, ViewChild, inject, output } from '@angular/core';
import { IonicModule, IonRefresher } from '@ionic/angular';
import { HapticService } from '../services/haptic.service';

/**
 * Thin wrapper around `<ion-refresher>` that emits a typed `(refresh)` event
 * and hides the imperative `complete()` API behind a method on the component.
 *
 * The host page mounts this inside an `<ion-content>` and calls `complete()`
 * once the data refresh is done — the underlying refresher animates out.
 */
@Component({
  selector: 'app-pull-to-refresh',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-refresher slot="fixed" (ionRefresh)="onRefresh()">
      <ion-refresher-content
        pullingIcon="chevron-down-circle-outline"
        refreshingSpinner="circular"
      />
    </ion-refresher>
  `,
})
export class PullToRefreshComponent {
  private readonly haptics = inject(HapticService);

  /** Emits each time the user completes a pull gesture. */
  readonly refresh = output<void>();

  @ViewChild(IonRefresher) private readonly refresher?: IonRefresher;

  onRefresh(): void {
    // Best-effort haptic — failures here must not block the refresh.
    void this.haptics.light();
    this.refresh.emit();
  }

  /** Closes the refresher animation. Call when the data load completes. */
  async complete(): Promise<void> {
    await this.refresher?.complete();
  }
}
