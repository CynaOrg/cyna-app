import { Injectable, InjectionToken, inject } from '@angular/core';
import { Share as CapacitorShare } from '@capacitor/share';
import { NativePlatformService } from './native-platform.service';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Injection token for the `@capacitor/share` plugin. The default factory
 * returns the real plugin proxy. Tests provide a fake via
 * `{ provide: SHARE_PLUGIN, useValue: mock }`.
 */
export const SHARE_PLUGIN = new InjectionToken<typeof CapacitorShare>(
  'SHARE_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorShare },
);

/**
 * Minimal abstraction over the Web Share API / `navigator.clipboard`. Used
 * for tests that need to stub the global browser primitives without
 * touching `window` directly.
 */
export const WEB_SHARE_ADAPTER = new InjectionToken<WebShareAdapter>(
  'WEB_SHARE_ADAPTER',
  {
    providedIn: 'root',
    factory: () => ({
      canShare: () =>
        typeof navigator !== 'undefined' && typeof navigator.share === 'function',
      share: (data) => navigator.share(data),
      copyToClipboard: async (text) => {
        if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        return false;
      },
    }),
  },
);

export interface WebShareAdapter {
  canShare(): boolean;
  share(data: { title?: string; text?: string; url?: string }): Promise<void>;
  copyToClipboard(text: string): Promise<boolean>;
}

/**
 * Wrapper around `@capacitor/share`. Falls back to `navigator.share` on web
 * and to `navigator.clipboard.writeText` when neither is available. Always
 * resolves — never throws. Use from any component that wants to expose a
 * "Share this" action (product detail, order confirmation, etc.).
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly platform = inject(NativePlatformService);
  private readonly share$ = inject(SHARE_PLUGIN);
  private readonly web = inject(WEB_SHARE_ADAPTER);

  /**
   * Opens the native share sheet on iOS/Android, or falls back to the
   * Web Share API / clipboard on web. Returns `true` when the share (or
   * fallback copy) was attempted, `false` if nothing happened.
   */
  async share(options: ShareOptions): Promise<boolean> {
    if (this.platform.isNative()) {
      try {
        await this.share$.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle,
        });
        return true;
      } catch {
        // Native sheet failure (user cancelled, plugin missing). Fall
        // through to the web path so the call site still does *something*
        // useful in dev.
      }
    }

    if (this.web.canShare()) {
      try {
        await this.web.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch {
        // navigator.share rejects on user cancel — treat as soft failure.
        return false;
      }
    }

    const fallbackText =
      options.url ?? options.text ?? options.title ?? '';
    if (!fallbackText) {
      return false;
    }
    try {
      return await this.web.copyToClipboard(fallbackText);
    } catch {
      return false;
    }
  }
}
