export { HapticService } from './haptic.service';
export { StatusBarService } from './status-bar.service';
export { AppLifecycleService } from './app-lifecycle.service';
export {
  NativePlatformService,
  HAPTICS_PLUGIN,
  STATUS_BAR_PLUGIN,
  APP_PLUGIN,
} from './native-platform.service';
export {
  BiometricAuthService,
  BIOMETRIC_AUTH_PLUGIN,
} from './biometric.service';
export type { BiometryKind } from './biometric.service';
export {
  ShareService,
  SHARE_PLUGIN,
  WEB_SHARE_ADAPTER,
} from './share.service';
export type { ShareOptions, WebShareAdapter } from './share.service';
export {
  NetworkService,
  NETWORK_PLUGIN,
  BROWSER_NETWORK_ADAPTER,
} from './network.service';
export type {
  BrowserNetworkAdapter,
  NetworkState,
} from './network.service';
export { DeepLinkService } from './deep-link.service';
