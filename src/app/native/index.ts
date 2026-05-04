/**
 * Public surface of the native module.
 *
 * Outside code should only import from this barrel. Anything not re-exported
 * here is considered internal to the native shell and may change without
 * notice.
 */
export { NativeShellComponent } from './shell/native-shell.component';
export { NativeRoutesModule } from './native-routes.module';
export { NATIVE_ROUTES } from './native.routes';

export { NativeMobileHeaderComponent } from './components/native-mobile-header.component';
export { NativeBottomNavComponent } from './components/native-bottom-nav.component';
export { SkeletonListComponent } from './components/skeleton-list.component';
export type { SkeletonVariant } from './components/skeleton-list.component';
export { PullToRefreshComponent } from './components/pull-to-refresh.component';

export { HapticOnDirective } from './directives/haptic-on.directive';
export type { HapticLevel } from './directives/haptic-on.directive';

export { NativePlatformService } from './services/native-platform.service';
export { HapticService } from './services/haptic.service';
export { StatusBarService } from './services/status-bar.service';
export { ShareService } from './services/share.service';
export { NetworkService } from './services/network.service';
export { BiometricService } from './services/biometric.service';
export { DeepLinkService } from './services/deep-link.service';
export { AppLifecycleService } from './services/app-lifecycle.service';
