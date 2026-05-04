import { DestroyRef, Injectable, inject } from '@angular/core';
import type { AppState, URLOpenListenerEvent } from '@capacitor/app';
import { Observable, Subject } from 'rxjs';
import { NativePlatformService } from './native-platform.service';
import { APP_PLUGIN } from './plugins.tokens';

/**
 * Wrapper around `@capacitor/app` lifecycle events.
 *
 * Three Subjects are exposed instead of plain Capacitor handles so callers
 * can `.pipe()` and unsubscribe through Angular's destroy ref. `init()` is
 * idempotent and only registers listeners on native — on the web we expose
 * empty observables so the rest of the code does not need a platform check.
 */
@Injectable({ providedIn: 'root' })
export class AppLifecycleService {
  private readonly platform = inject(NativePlatformService);
  private readonly app = inject(APP_PLUGIN);
  private readonly destroyRef = inject(DestroyRef);

  private readonly urlOpenSubject = new Subject<URLOpenListenerEvent>();
  private readonly stateChangeSubject = new Subject<AppState>();
  private readonly backButtonSubject = new Subject<void>();

  /** Emits each time the OS hands the app a custom-scheme or universal-link URL. */
  readonly urlOpen$: Observable<URLOpenListenerEvent> =
    this.urlOpenSubject.asObservable();

  /** Emits on background/foreground transitions. */
  readonly stateChange$: Observable<AppState> =
    this.stateChangeSubject.asObservable();

  /** Emits on Android hardware back button presses (no-op on iOS). */
  readonly backButton$: Observable<void> = this.backButtonSubject.asObservable();

  private initialised = false;
  private listeners: Array<{ remove: () => Promise<void> }> = [];

  async init(): Promise<void> {
    if (this.initialised) {
      return;
    }
    this.initialised = true;

    if (!this.platform.isNative()) {
      return;
    }

    try {
      this.listeners.push(
        (await this.app.addListener('appUrlOpen', (event) =>
          this.urlOpenSubject.next(event),
        )) as { remove: () => Promise<void> },
        (await this.app.addListener('appStateChange', (state) =>
          this.stateChangeSubject.next(state),
        )) as { remove: () => Promise<void> },
        (await this.app.addListener('backButton', () =>
          this.backButtonSubject.next(),
        )) as { remove: () => Promise<void> },
      );
    } catch {
      /* no-op: lifecycle listeners are best-effort */
    }

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private dispose(): void {
    for (const handle of this.listeners) {
      handle.remove().catch(() => undefined);
    }
    this.listeners = [];
    this.initialised = false;
  }
}
