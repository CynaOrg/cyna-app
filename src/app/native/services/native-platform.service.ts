import { Injectable } from '@angular/core';
import { isNativeCapacitor } from '@core/utils/platform.utils';

/**
 * Thin DI wrapper around the project-wide `isNativeCapacitor()` helper.
 *
 * Centralising the detection in a service makes other native services trivial
 * to test (they accept a mock that returns whatever value the test needs)
 * without leaking the detection logic to every consumer.
 */
@Injectable({ providedIn: 'root' })
export class NativePlatformService {
  /** True when the app is running inside a Capacitor native runtime. */
  isNative(): boolean {
    return isNativeCapacitor();
  }
}
