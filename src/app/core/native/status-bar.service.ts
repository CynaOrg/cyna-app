import { Injectable, inject } from '@angular/core';
import { Style } from '@capacitor/status-bar';
import {
  NativePlatformService,
  STATUS_BAR_PLUGIN,
} from './native-platform.service';

/**
 * Wrapper around `@capacitor/status-bar` to control the iOS status bar
 * appearance. No-op on web / SSR. Designed to be initialised once at boot
 * via `init()` then driven by feature pages when they need a contrasting
 * background (e.g. dark hero sections).
 */
@Injectable({ providedIn: 'root' })
export class StatusBarService {
  private readonly platform = inject(NativePlatformService);
  private readonly statusBar = inject(STATUS_BAR_PLUGIN);

  /**
   * Initial setup invoked at app boot. Sets a sensible default and ensures
   * the bar overlays the WebView so safe-area insets stay accurate.
   */
  async init(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Default });
      await this.statusBar.setOverlaysWebView({ overlay: true });
    } catch {
      // Fail silently — status bar styling is non-critical.
    }
  }

  /**
   * Light status bar (dark icons/text) — for light backgrounds.
   */
  async setLight(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Light });
    } catch {
      // Fail silently.
    }
  }

  /**
   * Dark status bar (light icons/text) — for dark backgrounds.
   */
  async setDark(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Dark });
    } catch {
      // Fail silently.
    }
  }

  /**
   * Set the status bar background color (Android only — iOS ignores this
   * because the status bar overlays the WebView). Provided for parity.
   *
   * @param hex Hex color string, e.g. `#1447E6`.
   */
  async setColor(hex: string): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setBackgroundColor({ color: hex });
    } catch {
      // Fail silently — iOS will reject this.
    }
  }
}
