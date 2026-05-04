import { InjectionToken } from '@angular/core';
import {
  BiometricAuth,
  type BiometricAuthPlugin,
} from '@aparajita/capacitor-biometric-auth';
import { App, type AppPlugin } from '@capacitor/app';
import { Haptics, type HapticsPlugin } from '@capacitor/haptics';
import { Network, type NetworkPlugin } from '@capacitor/network';
import { Share, type SharePlugin } from '@capacitor/share';
import { StatusBar, type StatusBarPlugin } from '@capacitor/status-bar';

/**
 * Capacitor plugins are exposed as ES Proxy objects from `registerPlugin()`.
 * The proxies recreate method wrappers on every access, which means Jasmine
 * `spyOn(Plugin, 'method')` cannot intercept them. To keep services testable
 * we route every plugin access through an Angular injection token: tests
 * provide a stub object, production injects the real plugin.
 */
export const HAPTICS_PLUGIN = new InjectionToken<HapticsPlugin>(
  'HAPTICS_PLUGIN',
  {
    providedIn: 'root',
    factory: () => Haptics,
  },
);

export const STATUS_BAR_PLUGIN = new InjectionToken<StatusBarPlugin>(
  'STATUS_BAR_PLUGIN',
  {
    providedIn: 'root',
    factory: () => StatusBar,
  },
);

export const SHARE_PLUGIN = new InjectionToken<SharePlugin>('SHARE_PLUGIN', {
  providedIn: 'root',
  factory: () => Share,
});

export const NETWORK_PLUGIN = new InjectionToken<NetworkPlugin>(
  'NETWORK_PLUGIN',
  {
    providedIn: 'root',
    factory: () => Network,
  },
);

export const BIOMETRIC_PLUGIN = new InjectionToken<BiometricAuthPlugin>(
  'BIOMETRIC_PLUGIN',
  {
    providedIn: 'root',
    factory: () => BiometricAuth,
  },
);

export const APP_PLUGIN = new InjectionToken<AppPlugin>('APP_PLUGIN', {
  providedIn: 'root',
  factory: () => App,
});
