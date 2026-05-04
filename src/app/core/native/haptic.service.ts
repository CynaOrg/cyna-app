import { Injectable, inject } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import {
  HAPTICS_PLUGIN,
  NativePlatformService,
} from './native-platform.service';

/**
 * Wrapper around `@capacitor/haptics` that fails silently when not running
 * inside a native Capacitor shell (web / SSR). Use this from any component
 * to trigger consistent haptic feedback patterns.
 */
@Injectable({ providedIn: 'root' })
export class HapticService {
  private readonly platform = inject(NativePlatformService);
  private readonly haptics = inject(HAPTICS_PLUGIN);

  /**
   * Light impact — small UI confirmations (toggle, tab change).
   */
  async light(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Fail silently — haptics are non-critical UX.
    }
  }

  /**
   * Medium impact — standard button taps, list item selection.
   */
  async medium(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Fail silently.
    }
  }

  /**
   * Heavy impact — destructive actions, important confirmations.
   */
  async heavy(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Fail silently.
    }
  }

  /**
   * Selection change — picker scrolls, segmented control changes.
   */
  async selection(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.selectionStart();
      await this.haptics.selectionChanged();
      await this.haptics.selectionEnd();
    } catch {
      // Fail silently.
    }
  }
}
