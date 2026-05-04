import { Injectable, InjectionToken } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Haptics as CapacitorHaptics } from '@capacitor/haptics';
import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { isNativeCapacitor } from '../utils/platform.utils';

/**
 * Thin wrapper over `isNativeCapacitor()` that can be mocked via Angular
 * DI in tests. Use this everywhere a service needs to branch on native
 * vs web — it makes the call site trivially testable.
 */
@Injectable({ providedIn: 'root' })
export class NativePlatformService {
  isNative(): boolean {
    return isNativeCapacitor();
  }
}

/**
 * Injection tokens for the Capacitor plugin objects. The default factory
 * returns the real plugin proxy from `@capacitor/<plugin>`. Tests can
 * provide a fake via `{ provide: HAPTICS_PLUGIN, useValue: mock }` —
 * which is what the Capacitor proxies require, since their methods are
 * synthesised on access and cannot be spied with `spyOn(...)`.
 */
export const HAPTICS_PLUGIN = new InjectionToken<typeof CapacitorHaptics>(
  'HAPTICS_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorHaptics },
);

export const STATUS_BAR_PLUGIN = new InjectionToken<typeof CapacitorStatusBar>(
  'STATUS_BAR_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorStatusBar },
);

export const APP_PLUGIN = new InjectionToken<typeof CapacitorApp>(
  'APP_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorApp },
);
