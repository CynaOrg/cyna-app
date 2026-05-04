import { Injectable, inject } from '@angular/core';
import { NativePlatformService } from './native-platform.service';
import { SHARE_PLUGIN } from './plugins.tokens';

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
  /** Title shown on the Android share sheet (ignored elsewhere). */
  dialogTitle?: string;
}

/**
 * Cross-platform share with progressive fallbacks.
 *
 * Resolution order:
 *   1. Native Capacitor Share plugin (full system sheet)
 *   2. `navigator.share` (PWA on mobile browsers)
 *   3. Clipboard copy of the URL (last resort, never throws)
 *
 * Returns true when the user actively shared/copied, false when nothing
 * could be done.
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly platform = inject(NativePlatformService);
  private readonly sharePlugin = inject(SHARE_PLUGIN);

  async share(payload: SharePayload): Promise<boolean> {
    if (this.platform.isNative()) {
      try {
        await this.sharePlugin.share(payload);
        return true;
      } catch {
        /* fall through to web fallbacks */
      }
    }

    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
        return true;
      } catch {
        /* user cancelled or unsupported, try clipboard */
      }
    }

    if (payload.url && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload.url);
        return true;
      } catch {
        /* nothing else we can do */
      }
    }

    return false;
  }
}
