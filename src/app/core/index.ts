// Core module - singleton services, guards, interceptors
// Export your core services, guards, and interceptors here

export { isNativeCapacitor } from './utils/platform.utils';
export {
  nativeOnlyGuard,
  browserOnlyGuard,
} from './guards/platform-redirect.guard';
export { authGuard } from './guards/auth.guard';

// Interceptors
export { AuthInterceptor } from './interceptors/auth.interceptor';

// Interfaces
export * from './interfaces';

// Services
export * from './services';

// Stores
export * from './stores';

// Mocks
export * from './mocks/products.mock';
