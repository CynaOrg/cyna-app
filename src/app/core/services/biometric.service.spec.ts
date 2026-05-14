import { TestBed } from '@angular/core/testing';
import { BiometricService } from './biometric.service';

describe('BiometricService (web fallback)', () => {
  let service: BiometricService;
  let originalCap: unknown;

  beforeEach(() => {
    originalCap = (window as any).Capacitor;
    delete (window as any).Capacitor;
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiometricService);
  });

  afterEach(() => {
    if (originalCap === undefined) delete (window as any).Capacitor;
    else (window as any).Capacitor = originalCap;
  });

  it('isAvailable() returns false on web', async () => {
    expect(await service.isAvailable()).toBeFalse();
  });

  it('getBiometryType() returns none on web', async () => {
    expect(await service.getBiometryType()).toBe('none');
  });

  it('prompt() returns biometryNotAvailable on web', async () => {
    const result = await service.prompt('Authenticate');
    expect(result.success).toBeFalse();
    expect(result.code).toBe('biometryNotAvailable');
  });
});
