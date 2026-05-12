import { Injectable } from '@angular/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Preferences } from '@capacitor/preferences';
import { isNativeCapacitor } from '../utils/platform.utils';

/**
 * Wrapper around @aparajita/capacitor-secure-storage that:
 *  - reads/writes from the iOS Keychain (or Android KeyStore) on native,
 *  - falls back to Capacitor Preferences on web,
 *  - performs a soft migration: if a value is found only in Preferences on
 *    native, it is moved to SecureStorage and removed from Preferences.
 *
 * Soft migration ensures users that were logged in before this plugin was
 * introduced are not forcibly signed out.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  /**
   * Read a string value associated with the given key.
   *
   * On native, the value is read from the Keychain. If absent, we look in
   * Preferences as a fallback; if found there we migrate it to the Keychain
   * and remove it from Preferences (soft migration).
   *
   * On web, the value is read from Preferences (no Keychain on the web).
   */
  async getItem(key: string): Promise<string | null> {
    if (!isNativeCapacitor()) {
      const { value } = await Preferences.get({ key });
      return value;
    }

    try {
      const secureValue = await SecureStorage.get(key);
      if (secureValue !== null && secureValue !== undefined) {
        return String(secureValue);
      }
    } catch {
      // Fall through to migration path on osError
    }

    const { value: prefValue } = await Preferences.get({ key });
    if (prefValue !== null) {
      try {
        await SecureStorage.set(key, prefValue);
        await Preferences.remove({ key });
        // eslint-disable-next-line no-console
        console.log(
          `[AUTH] Token migrated from Preferences to SecureStorage: ${key}`,
        );
      } catch (err) {
        // If migration fails, surface the Preferences value anyway so the
        // user is not logged out on a transient OS error.
        // eslint-disable-next-line no-console
        console.warn('[AUTH] SecureStorage migration failed', err);
      }
      return prefValue;
    }
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!isNativeCapacitor()) {
      await Preferences.set({ key, value });
      return;
    }
    await SecureStorage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (!isNativeCapacitor()) {
      await Preferences.remove({ key });
      return;
    }
    try {
      await SecureStorage.remove(key);
    } catch {
      // Best-effort: ignore osError if key was already absent.
    }
    // Defensive: also strip any stale Preferences value with the same key.
    try {
      await Preferences.remove({ key });
    } catch {
      // ignore
    }
  }
}
