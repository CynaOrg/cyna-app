import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NetworkService } from '@core/native';

/**
 * Global, fixed-top banner shown whenever the device reports an offline
 * network state. Mounted once at the root of `AppComponent`. Stays out of
 * the way when online (the entire DOM node is conditionally rendered).
 *
 * Animation is a soft slide-down keyframe defined inline so the component
 * stays self-contained — Tailwind handles the rest.
 */
@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (!isOnline()) {
      <div
        role="status"
        aria-live="polite"
        class="offline-banner fixed left-0 right-0 z-[60] flex items-center justify-center gap-2 px-4 text-center"
        style="
          top: env(safe-area-inset-top, 0px);
          padding-top: 8px;
          padding-bottom: 8px;
          background-color: rgba(255, 56, 60, 0.95);
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        "
      >
        <span
          aria-hidden="true"
          style="
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background-color: #ffffff;
            display: inline-block;
          "
        ></span>
        <span>{{ 'OFFLINE.BANNER' | translate }}</span>
      </div>
    }
  `,
  styles: [
    `
      .offline-banner {
        animation: offline-slide-down 220ms ease-out;
      }

      @keyframes offline-slide-down {
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

  /** Bound directly to the network service signal. */
  readonly isOnline = this.network.isOnline;
}
