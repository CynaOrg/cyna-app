import { Injectable, inject } from '@angular/core';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';
import { NativePlatformService } from './native-platform.service';
import { BIOMETRIC_PLUGIN } from './plugins.tokens';

/**
 * Wrapper around `@aparajita/capacitor-biometric-auth`.
 *
 * The web has no biometric concept so every call short-circuits to a safe
 * default. On native we still guard each call with a try/catch because the
 * plugin throws for "no enrolment", "lockout", "user cancel" etc., and we
 * want those situations to look the same to callers: simply "auth failed".
 */
@Injectable({ providedIn: 'root' })
export class BiometricService {
  private readonly platform = inject(NativePlatformService);
  private readonly biometric = inject(BIOMETRIC_PLUGIN);

  /** True when the device exposes any biometry that we can prompt. */
  async isAvailable(): Promise<boolean> {
    if (!this.platform.isNative()) {
      return false;
    }
    try {
      const result = await this.biometric.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  /** Returns the primary biometry type or `BiometryType.none`. */
  async getBiometryType(): Promise<BiometryType> {
    if (!this.platform.isNative()) {
      return BiometryType.none;
    }
    try {
      const result = await this.biometric.checkBiometry();
      return result.biometryType;
    } catch {
      return BiometryType.none;
    }
  }

  /**
   * Prompts the user. Resolves true on success, false on cancel/error.
   * Never throws — the UI layer can rely on the boolean.
   */
  async authenticate(reason: string): Promise<boolean> {
    if (!this.platform.isNative()) {
      return false;
    }
    try {
      await this.biometric.authenticate({ reason });
      return true;
    } catch {
      return false;
    }
  }
}
