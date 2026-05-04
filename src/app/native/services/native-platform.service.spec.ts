import { TestBed } from '@angular/core/testing';
import { NativePlatformService } from './native-platform.service';

describe('NativePlatformService', () => {
  let service: NativePlatformService;
  let originalCapacitor: unknown;

  beforeEach(() => {
    originalCapacitor = (window as any).Capacitor;
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativePlatformService);
  });

  afterEach(() => {
    (window as any).Capacitor = originalCapacitor;
  });

  it('returns false in a regular browser context', () => {
    (window as any).Capacitor = undefined;
    expect(service.isNative()).toBe(false);
  });

  it('returns true when PluginHeaders are injected by the native runtime', () => {
    (window as any).Capacitor = { PluginHeaders: [{ name: 'App' }] };
    expect(service.isNative()).toBe(true);
  });
});
