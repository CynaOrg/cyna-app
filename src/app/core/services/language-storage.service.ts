import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { isNativeCapacitor } from '../utils/platform.utils';

const COOKIE_KEY = 'cyna_lang';

/**
 * Persists the user's language preference.
 *
 * Web: writes to `document.cookie` (Secure, SameSite=Strict, max-age=1y) so the
 * preference travels with HTTP requests and is read on subsequent visits.
 *
 * Native (Capacitor iOS/Android): cookies are unreliable on `capacitor://`
 * (Secure attribute is rejected, persistence across launches is brittle), so
 * the value is also mirrored in `@capacitor/preferences` and re-hydrated into
 * the cookie at app boot for code paths that still read `document.cookie`.
 */
@Injectable({ providedIn: 'root' })
export class LanguageStorageService {
  /** Read the saved language. Returns null if no preference is stored. */
  async load(): Promise<'fr' | 'en' | null> {
    const fromCookie = this.readCookie();
    if (fromCookie) return fromCookie;
    if (!isNativeCapacitor()) return null;
    try {
      const { value } = await Preferences.get({ key: COOKIE_KEY });
      if (value === 'fr' || value === 'en') {
        // Mirror to cookie so synchronous readers (LOCALE_ID factory, HTTP
        // interceptor, …) see the value without an async round-trip.
        this.writeCookie(value);
        return value;
      }
    } catch {
      // ignore
    }
    return null;
  }

  /** Persist the language. Best-effort; never throws. */
  async save(lang: 'fr' | 'en'): Promise<void> {
    this.writeCookie(lang);
    if (isNativeCapacitor()) {
      try {
        await Preferences.set({ key: COOKIE_KEY, value: lang });
      } catch {
        // ignore
      }
    }
  }

  private readCookie(): 'fr' | 'en' | null {
    const raw = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE_KEY}=`))
      ?.split('=')[1];
    return raw === 'fr' || raw === 'en' ? raw : null;
  }

  private writeCookie(lang: 'fr' | 'en'): void {
    // No `Secure` on native — `capacitor://` is not HTTPS and Safari/WKWebView
    // would reject the cookie outright. Web origins are HTTPS-only in
    // production so the cookie still gets the secure attribute there.
    const secure = isNativeCapacitor() ? '' : 'Secure;';
    document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000;${secure}SameSite=Strict`;
  }
}
