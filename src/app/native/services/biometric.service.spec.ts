import { TestBed } from '@angular/core/testing';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';
import { BiometricService } from './biometric.service';
import { NativePlatformService } from './native-platform.service';
import { BIOMETRIC_PLUGIN } from './plugins.tokens';

describe('BiometricService', () => {
  let service: BiometricService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: { checkBiometry: jasmine.Spy; authenticate: jasmine.Spy };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      checkBiometry: jasmine.createSpy('checkBiometry').and.resolveTo({
        isAvailable: true,
        biometryType: BiometryType.faceId,
        biometryTypes: [BiometryType.faceId],
        strongBiometryIsAvailable: true,
        deviceIsSecure: true,
        reason: '',
        code: '' as any,
      }),
      authenticate: jasmine.createSpy('authenticate').and.resolveTo(),
    };
    TestBed.configureTestingModule({
      providers: [
        BiometricService,
        { provide: NativePlatformService, useValue: platform },
        { provide: BIOMETRIC_PLUGIN, useValue: plugin },
      ],
    });
    service = TestBed.inject(BiometricService);
  });

  it('reports unavailable on the web', async () => {
    platform.isNative.and.returnValue(false);
    expect(await service.isAvailable()).toBe(false);
    expect(await service.getBiometryType()).toBe(BiometryType.none);
    expect(await service.authenticate('reason')).toBe(false);
  });

  it('forwards to checkBiometry on native', async () => {
    platform.isNative.and.returnValue(true);
    expect(await service.isAvailable()).toBe(true);
    expect(await service.getBiometryType()).toBe(BiometryType.faceId);
  });

  it('returns true on successful authenticate', async () => {
    platform.isNative.and.returnValue(true);
    expect(await service.authenticate('Sign in')).toBe(true);
  });

  it('returns false when authenticate rejects (cancel/error)', async () => {
    platform.isNative.and.returnValue(true);
    plugin.authenticate.and.rejectWith(new Error('cancel'));
    expect(await service.authenticate('Sign in')).toBe(false);
  });
});
