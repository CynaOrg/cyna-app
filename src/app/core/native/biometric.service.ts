import { Injectable, InjectionToken, inject } from '@angular/core';
import {
  BiometricAuth,
  BiometryType,
  type BiometricAuthPlugin,
} from '@aparajita/capacitor-biometric-auth';
import { NativePlatformService } from './native-platform.service';

/**
 * Injection token for the biometric auth plugin. The default factory returns
 * the real plugin proxy from `@aparajita/capacitor-biometric-auth`. Tests can
 * provide a fake via `{ provide: BIOMETRIC_AUTH_PLUGIN, useValue: mock }`.
 */
export const BIOMETRIC_AUTH_PLUGIN = new InjectionToken<BiometricAuthPlugin>(
  'BIOMETRIC_AUTH_PLUGIN',
  { providedIn: 'root', factory: () => BiometricAuth },
);

/**
 * Friendly biometry kind exposed to the UI (used to render labels like
 * "Face ID", "Touch ID" or generic "biométrie").
 */
export type BiometryKind = 'faceId' | 'touchId' | 'fingerprint' | 'none';

/**
 * Wrapper around `@aparajita/capacitor-biometric-auth` that fails silently
 * when not running inside a native Capacitor shell (web / SSR).
 *
 * Methods never throw — `authenticate()` returns a boolean instead.
 */
@Injectable({ providedIn: 'root' })
export class BiometricAuthService {
  private readonly platform = inject(NativePlatformService);
  private readonly plugin = inject(BIOMETRIC_AUTH_PLUGIN);

  /**
   * Returns true if the device supports biometry AND the user has enrolled
   * (e.g. registered a face / fingerprint). Always false on web.
   */
  async isAvailable(): Promise<boolean> {
    if (!this.platform.isNative()) {
      return false;
    }
    try {
      const result = await this.plugin.checkBiometry();
      return Boolean(result?.isAvailable);
    } catch {
      return false;
    }
  }

  /**
   * Returns the primary biometry kind the device supports. Use this to
   * render dynamic labels in the UI (Face ID vs Touch ID).
   */
  async getBiometryType(): Promise<BiometryKind> {
    if (!this.platform.isNative()) {
      return 'none';
    }
    try {
      const result = await this.plugin.checkBiometry();
      switch (result?.biometryType) {
        case BiometryType.faceId:
        case BiometryType.faceAuthentication:
          return 'faceId';
        case BiometryType.touchId:
          return 'touchId';
        case BiometryType.fingerprintAuthentication:
          return 'fingerprint';
        default:
          return 'none';
      }
    } catch {
      return 'none';
    }
  }

  /**
   * Triggers the OS biometric prompt. Returns true on success, false on any
   * error or user cancellation. Never throws.
   *
   * @param reason Localized message displayed in the prompt.
   */
  async authenticate(reason: string): Promise<boolean> {
    if (!this.platform.isNative()) {
      return false;
    }
    try {
      await this.plugin.authenticate({
        reason,
        cancelTitle: 'Annuler',
        iosFallbackTitle: '',
      });
      return true;
    } catch {
      return false;
    }
  }
}
