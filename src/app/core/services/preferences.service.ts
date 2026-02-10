import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }

  private cachedSessionId: string | null = null;

  async getOrCreateSessionId(): Promise<string> {
    if (this.cachedSessionId) return this.cachedSessionId;

    const SESSION_KEY = 'session_id';
    let sessionId = await this.get<string>(SESSION_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      await this.set(SESSION_KEY, sessionId);
    }

    this.cachedSessionId = sessionId;
    return sessionId;
  }

  async regenerateSessionId(): Promise<string> {
    const SESSION_KEY = 'session_id';
    const newSessionId = crypto.randomUUID();
    await this.set(SESSION_KEY, newSessionId);
    this.cachedSessionId = newSessionId;
    return newSessionId;
  }
}
