import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { ConnectionStatus } from '@capacitor/network';
import { NativePlatformService } from './native-platform.service';
import { NETWORK_PLUGIN } from './plugins.tokens';

/**
 * Connectivity state with a single source of truth.
 *
 * On native we listen to the Capacitor `networkStatusChange` event; on the
 * web we observe `navigator.onLine` and the `online`/`offline` events. Both
 * paths feed the same signal so consumers don't care about the platform.
 *
 * `init()` must be called once during app bootstrap (or whenever a consumer
 * needs the listener live). It is safe to call multiple times — the second
 * call is a no-op.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly platform = inject(NativePlatformService);
  private readonly network = inject(NETWORK_PLUGIN);
  private readonly destroyRef = inject(DestroyRef);

  /** True when the device thinks it has network. Defaults to true. */
  readonly isOnline = signal<boolean>(true);

  private initialised = false;
  private nativeListenerHandle: { remove: () => Promise<void> } | undefined;
  private readonly onOnline = () => this.isOnline.set(true);
  private readonly onOffline = () => this.isOnline.set(false);

  async init(): Promise<void> {
    if (this.initialised) {
      return;
    }
    this.initialised = true;

    if (this.platform.isNative()) {
      try {
        const status = await this.network.getStatus();
        this.isOnline.set(status.connected);
        this.nativeListenerHandle = (await this.network.addListener(
          'networkStatusChange',
          (s: ConnectionStatus) => this.isOnline.set(s.connected),
        )) as { remove: () => Promise<void> };
      } catch {
        /* no-op: leave default online state */
      }
    } else {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', this.onOnline);
      window.addEventListener('offline', this.onOffline);
    }

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private dispose(): void {
    if (this.platform.isNative()) {
      this.nativeListenerHandle?.remove().catch(() => undefined);
      this.nativeListenerHandle = undefined;
    } else {
      window.removeEventListener('online', this.onOnline);
      window.removeEventListener('offline', this.onOffline);
    }
    this.initialised = false;
  }
}
