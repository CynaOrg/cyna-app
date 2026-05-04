import { Injectable, inject } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { NativePlatformService } from './native-platform.service';
import { HAPTICS_PLUGIN } from './plugins.tokens';

/**
 * Wrapper around `@capacitor/haptics` with web-safe no-ops.
 *
 * Every method swallows errors silently because haptic feedback is a "nice
 * to have": failing here must never break the surrounding interaction. The
 * web fallback short-circuits before touching the plugin, so the web bundle
 * stays free of plugin-side effects.
 */
@Injectable({ providedIn: 'root' })
export class HapticService {
  private readonly platform = inject(NativePlatformService);
  private readonly haptics = inject(HAPTICS_PLUGIN);

  /** Light tap, suitable for selection or small UI ticks. */
  async light(): Promise<void> {
    await this.impact(ImpactStyle.Light);
  }

  /** Medium tap, suitable for confirmations. */
  async medium(): Promise<void> {
    await this.impact(ImpactStyle.Medium);
  }

  /** Heavy tap, suitable for errors or critical actions. */
  async heavy(): Promise<void> {
    await this.impact(ImpactStyle.Heavy);
  }

  /** Selection-style feedback (used on segmented control changes etc). */
  async selection(): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.selectionStart();
      await this.haptics.selectionEnd();
    } catch {
      /* no-op: haptics are best-effort */
    }
  }

  private async impact(style: ImpactStyle): Promise<void> {
    if (!this.platform.isNative()) {
      return;
    }
    try {
      await this.haptics.impact({ style });
    } catch {
      /* no-op: haptics are best-effort */
    }
  }
}
