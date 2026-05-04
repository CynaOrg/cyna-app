import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NetworkService } from '../services/network.service';

/**
 * Top-of-shell banner shown whenever the device is offline.
 *
 * Subscribes to `NetworkService.isOnline` (a signal) and slides down a small
 * red strip pinned just under the safe-area inset so it never overlaps the
 * notch / status bar on iOS. The banner is purely presentational — it does
 * not block the UI underneath.
 *
 * Accessibility: the host has `role="status"` and `aria-live="polite"` so
 * screen readers announce the connectivity drop without stealing focus.
 */
@Component({
  selector: 'app-offline-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-hidden]': 'isOnline() ? "true" : null',
  },
  template: `
    @if (!isOnline()) {
      <div
        class="offline-banner-strip"
        style="
          position: fixed;
          top: env(safe-area-inset-top, 0px);
          left: 0;
          right: 0;
          z-index: 60;
          padding: 8px 16px;
          background-color: #fee2e2;
          color: #991b1b;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          border-bottom: 1px solid rgba(153, 27, 27, 0.15);
          animation: offline-banner-slide-down 220ms ease-out;
        "
      >
        Mode hors-ligne — certaines fonctionnalités sont limitées
      </div>
    }
  `,
  styles: [
    `
      @keyframes offline-banner-slide-down {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class OfflineBannerComponent {
  private readonly network = inject(NetworkService);

  /** Bound from the network signal so the template re-renders on change. */
  readonly isOnline = computed(() => this.network.isOnline());
}
