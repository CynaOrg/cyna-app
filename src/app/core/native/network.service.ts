import {
  Injectable,
  InjectionToken,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Network as CapacitorNetwork } from '@capacitor/network';
import type {
  ConnectionStatus,
  ConnectionType,
} from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { NativePlatformService } from './native-platform.service';

/**
 * Injection token for the `@capacitor/network` plugin. Tests can override
 * via `{ provide: NETWORK_PLUGIN, useValue: mock }`.
 */
export const NETWORK_PLUGIN = new InjectionToken<typeof CapacitorNetwork>(
  'NETWORK_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorNetwork },
);

/**
 * Web fallback adapter wrapping `navigator.onLine` and the `online` /
 * `offline` events. Exposed as a token so tests don't have to monkey-patch
 * the global `navigator` / `window`.
 */
export interface BrowserNetworkAdapter {
  isOnline(): boolean;
  addEventListener(event: 'online' | 'offline', cb: () => void): void;
  removeEventListener(event: 'online' | 'offline', cb: () => void): void;
}

export const BROWSER_NETWORK_ADAPTER =
  new InjectionToken<BrowserNetworkAdapter>('BROWSER_NETWORK_ADAPTER', {
    providedIn: 'root',
    factory: () => ({
      isOnline: () =>
        typeof navigator === 'undefined' ? true : navigator.onLine,
      addEventListener: (event, cb) =>
        window.addEventListener(event, cb),
      removeEventListener: (event, cb) =>
        window.removeEventListener(event, cb),
    }),
  });

/**
 * Reactive online/offline state, backed by `@capacitor/network` on native
 * and `navigator.onLine` on web. Call `init()` once at boot from
 * `AppComponent.ngOnInit()` — subsequent calls are no-ops.
 *
 * Consumers can either:
 * - subscribe to `isOnline$` (RxJS) — handy from RxJS pipelines.
 * - read the `isOnline` Signal — handy from templates and effects.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService implements OnDestroy {
  private readonly platform = inject(NativePlatformService);
  private readonly network = inject(NETWORK_PLUGIN);
  private readonly browser = inject(BROWSER_NETWORK_ADAPTER);

  private readonly status$ = new BehaviorSubject<NetworkState>({
    isOnline: true,
    connectionType: 'unknown',
  });

  /** Snapshot of the current online state as a Signal. */
  readonly isOnline = signal(true);

  /** Stream of online state changes — distinct boolean. */
  readonly isOnline$: Observable<boolean> = this.status$.pipe(
    map((s) => s.isOnline),
    distinctUntilChanged(),
  );

  /** Full state stream including connection type. */
  readonly state$: Observable<NetworkState> = this.status$.asObservable();

  private listener: PluginListenerHandle | null = null;
  private webOnlineHandler: (() => void) | null = null;
  private webOfflineHandler: (() => void) | null = null;
  private initialised = false;

  /**
   * Subscribe to native or browser network events and seed the initial
   * state. Idempotent.
   */
  async init(): Promise<void> {
    if (this.initialised) {
      return;
    }
    this.initialised = true;

    if (this.platform.isNative()) {
      try {
        const initial = await this.network.getStatus();
        this.update(initial.connected, initial.connectionType);
        this.listener = await this.network.addListener(
          'networkStatusChange',
          (status: ConnectionStatus) =>
            this.update(status.connected, status.connectionType),
        );
      } catch {
        // Plugin missing or rejected — fall back to assuming online.
        this.update(true, 'unknown');
      }
      return;
    }

    // Web fallback.
    const initialOnline = this.browser.isOnline();
    this.update(initialOnline, initialOnline ? 'unknown' : 'none');
    this.webOnlineHandler = () => this.update(true, 'unknown');
    this.webOfflineHandler = () => this.update(false, 'none');
    this.browser.addEventListener('online', this.webOnlineHandler);
    this.browser.addEventListener('offline', this.webOfflineHandler);
  }

  ngOnDestroy(): void {
    try {
      this.listener?.remove();
    } catch {
      // Ignore — already removed or plugin unavailable.
    }
    this.listener = null;

    if (this.webOnlineHandler) {
      this.browser.removeEventListener('online', this.webOnlineHandler);
      this.webOnlineHandler = null;
    }
    if (this.webOfflineHandler) {
      this.browser.removeEventListener('offline', this.webOfflineHandler);
      this.webOfflineHandler = null;
    }
  }

  private update(connected: boolean, type: ConnectionType): void {
    this.isOnline.set(connected);
    this.status$.next({ isOnline: connected, connectionType: type });
  }
}

export interface NetworkState {
  isOnline: boolean;
  connectionType: ConnectionType;
}
