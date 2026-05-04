import { TestBed } from '@angular/core/testing';
import { NativePlatformService } from './native-platform.service';

describe('NativePlatformService', () => {
  let service: NativePlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativePlatformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns false in a regular browser context', () => {
    // Karma runs in Chrome — no Capacitor PluginHeaders, no androidBridge,
    // protocol is `http:`. The helper must return false here.
    expect(service.isNative()).toBeFalse();
  });
});
