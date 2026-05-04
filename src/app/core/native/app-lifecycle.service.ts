import { Injectable, OnDestroy, inject } from '@angular/core';
import { AppState, URLOpenListenerEvent } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Subject } from 'rxjs';
import {
  APP_PLUGIN,
  NativePlatformService,
} from './native-platform.service';

/**
 * Wrapper around `@capacitor/app` exposing the native app lifecycle as
 * RxJS subjects. Subscribes once at boot via `init()` and tears the native
 * listeners down on `ngOnDestroy`. No-op outside of a native Capacitor
 * shell.
 *
 * Streams:
 * - `urlOpen$` — emits on `appUrlOpen`. Used by the future deep-link
 *   handler (B8) to route `cyna://` URLs to the right page.
 * - `stateChange$` — emits on `appStateChange` (foreground/background).
 * - `backButton$` — emits on hardware back button press (Android only,
 *   provided here for parity with future Android support).
 */
@Injectable({ providedIn: 'root' })
export class AppLifecycleService implements OnDestroy {
  readonly urlOpen$ = new Subject<URLOpenListenerEvent>();
  readonly stateChange$ = new Subject<AppState>();
  readonly backButton$ = new Subject<void>();

  private readonly platform = inject(NativePlatformService);
  private readonly app = inject(APP_PLUGIN);
  private listeners: PluginListenerHandle[] = [];
  private initialised = false;

  /**
   * Register the native lifecycle listeners. Idempotent — calling twice
   * is a no-op. Safe to call from web / SSR (returns immediately).
   */
  async init(): Promise<void> {
    if (!this.platform.isNative() || this.initialised) {
      return;
    }
    this.initialised = true;

    try {
      const urlListener = await this.app.addListener(
        'appUrlOpen',
        (event: URLOpenListenerEvent) => this.urlOpen$.next(event),
      );
      const stateListener = await this.app.addListener(
        'appStateChange',
        (state: AppState) => this.stateChange$.next(state),
      );
      const backListener = await this.app.addListener('backButton', () =>
        this.backButton$.next(),
      );
      this.listeners.push(urlListener, stateListener, backListener);
    } catch {
      // Fail silently — lifecycle hooks are non-critical at boot.
    }
  }

  ngOnDestroy(): void {
    this.listeners.forEach((handle) => {
      try {
        handle.remove();
      } catch {
        // Ignore — already removed or plugin unavailable.
      }
    });
    this.listeners = [];
    this.urlOpen$.complete();
    this.stateChange$.complete();
    this.backButton$.complete();
  }
}
