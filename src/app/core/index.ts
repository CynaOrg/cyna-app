// Core module - singleton services, guards, interceptors
// Export your core services, guards, and interceptors here

export { isNativeCapacitor } from './utils/platform.utils';
export {
  nativeOnlyGuard,
  browserOnlyGuard,
} from './guards/platform-redirect.guard';
