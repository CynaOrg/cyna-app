import { Injectable } from '@angular/core';
import {
  BiometricAuth,
  BiometryError,
  BiometryType,
} from '@aparajita/capacitor-biometric-auth';
import { isNativeCapacitor } from '../utils/platform.utils';

export type BiometryLabel = 'faceId' | 'touchId' | 'fingerprint' | 'none';

/**
 * Thin wrapper around @aparajita/capacitor-biometric-auth.
 * Always returns safe defaults on non-native platforms so callers never have
 * to guard the platform themselves.
 */
@Injectable({ providedIn: 'root' })
export class BiometricService {
  /**
   * True if the device supports biometrics AND the user has enrolled at
   * least one biometric identity. Returns false on web.
   */
  async isAvailable(): Promise<boolean> {
    if (!isNativeCapacitor()) return false;
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async getBiometryType(): Promise<BiometryLabel> {
    if (!isNativeCapacitor()) return 'none';
    try {
      const result = await BiometricAuth.checkBiometry();
      switch (result.biometryType) {
        case BiometryType.faceId:
          return 'faceId';
        case BiometryType.touchId:
          return 'touchId';
        case BiometryType.fingerprintAuthentication:
        case BiometryType.faceAuthentication:
        case BiometryType.irisAuthentication:
          return 'fingerprint';
        default:
          return 'none';
      }
    } catch {
      return 'none';
    }
  }

  /**
   * Prompt the user to authenticate. Returns { success: true } on success and
   * { success: false, code } on failure (cancel, lockout, etc.).
   */
  async prompt(reason: string): Promise<{ success: boolean; code?: string }> {
    if (!isNativeCapacitor()) {
      return { success: false, code: 'biometryNotAvailable' };
    }
    try {
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Annuler',
        iosFallbackTitle: 'Utiliser le code',
        allowDeviceCredential: false,
      });
      return { success: true };
    } catch (err) {
      const code =
        err instanceof BiometryError
          ? err.code
          : err instanceof Error
            ? err.message
            : 'unknown';
      return { success: false, code };
    }
  }
}
