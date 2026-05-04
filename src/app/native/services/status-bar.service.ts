import { Injectable, inject } from '@angular/core';
import { Style } from '@capacitor/status-bar';
import { NativePlatformService } from './native-platform.service';
import { STATUS_BAR_PLUGIN } from './plugins.tokens';

/** CYNA primary brand colour (matches the splash screen background). */
const PRIMARY_COLOR = '#4f39f6';

/**
 * Wrapper around `@capacitor/status-bar` with web no-ops.
 *
 * `init()` is called by the native bootstrap exactly once to set the brand
 * colour; the `setLight()` / `setDark()` helpers exist so individual pages
 * can flip the icon contrast on dark backgrounds without re-implementing the
 * platform check.
 */
@Injectable({ providedIn: 'root' })
export class StatusBarService {
  private readonly platform = inject(NativePlatformService);
  private readonly statusBar = inject(STATUS_BAR_PLUGIN);

  /** Brand-coloured status bar with light icons. Safe to call multiple times. */
  async init(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Light });
      await this.statusBar.setBackgroundColor({ color: PRIMARY_COLOR });
    } catch {
      /* no-op: status bar styling is best-effort */
    }
  }

  /** Light icons (use over dark backgrounds). */
  async setLight(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Light });
    } catch {
      /* no-op */
    }
  }

  /** Dark icons (use over light backgrounds). */
  async setDark(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.statusBar.setStyle({ style: Style.Dark });
    } catch {
      /* no-op */
    }
  }
}
