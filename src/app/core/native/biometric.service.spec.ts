import { TestBed } from '@angular/core/testing';
import { BiometricAuthService } from './biometric.service';
import { BIOMETRIC_AUTH_PLUGIN } from './biometric.service';
import { NativePlatformService } from './native-platform.service';
import {
  BiometryType,
  BiometryErrorType,
} from '@aparajita/capacitor-biometric-auth';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockPlugin() {
  return {
    checkBiometry: jasmine.createSpy('checkBiometry').and.resolveTo({
      isAvailable: true,
      strongBiometryIsAvailable: true,
      biometryType: BiometryType.faceId,
      biometryTypes: [BiometryType.faceId],
      deviceIsSecure: true,
      reason: '',
      code: BiometryErrorType.none,
    }),
    authenticate: jasmine.createSpy('authenticate').and.resolveTo(),
    setBiometryType: jasmine.createSpy('setBiometryType').and.resolveTo(),
    setBiometryIsEnrolled: jasmine
      .createSpy('setBiometryIsEnrolled')
      .and.resolveTo(),
    setDeviceIsSecure: jasmine.createSpy('setDeviceIsSecure').and.resolveTo(),
    addResumeListener: jasmine.createSpy('addResumeListener').and.resolveTo({
      remove: jasmine.createSpy('remove').and.resolveTo(),
    }),
  };
}

describe('BiometricAuthService', () => {
  let service: BiometricAuthService;
  let platform: MockNativePlatformService;
  let mockPlugin: ReturnType<typeof createMockPlugin>;

  beforeEach(() => {
    platform = new MockNativePlatformService();
    mockPlugin = createMockPlugin();
    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: BIOMETRIC_AUTH_PLUGIN, useValue: mockPlugin },
      ],
    });
    service = TestBed.inject(BiometricAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('isAvailable() returns false without calling the plugin', async () => {
      const result = await service.isAvailable();
      expect(result).toBeFalse();
      expect(mockPlugin.checkBiometry).not.toHaveBeenCalled();
    });

    it('getBiometryType() returns "none"', async () => {
      const result = await service.getBiometryType();
      expect(result).toBe('none');
      expect(mockPlugin.checkBiometry).not.toHaveBeenCalled();
    });

    it('authenticate() returns false without prompting', async () => {
      const result = await service.authenticate('Reason');
      expect(result).toBeFalse();
      expect(mockPlugin.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('isAvailable() returns true when biometry is enrolled', async () => {
      const result = await service.isAvailable();
      expect(result).toBeTrue();
      expect(mockPlugin.checkBiometry).toHaveBeenCalled();
    });

    it('isAvailable() returns false when biometry is not enrolled', async () => {
      mockPlugin.checkBiometry.and.resolveTo({
        isAvailable: false,
        strongBiometryIsAvailable: false,
        biometryType: BiometryType.none,
        biometryTypes: [],
        deviceIsSecure: false,
        reason: 'no biometry',
        code: BiometryErrorType.biometryNotEnrolled,
      });
      const result = await service.isAvailable();
      expect(result).toBeFalse();
    });

    it('isAvailable() returns false when the plugin throws', async () => {
      mockPlugin.checkBiometry.and.rejectWith(new Error('plugin missing'));
      const result = await service.isAvailable();
      expect(result).toBeFalse();
    });

    it('getBiometryType() maps faceId', async () => {
      mockPlugin.checkBiometry.and.resolveTo({
        isAvailable: true,
        strongBiometryIsAvailable: true,
        biometryType: BiometryType.faceId,
        biometryTypes: [BiometryType.faceId],
        deviceIsSecure: true,
        reason: '',
        code: BiometryErrorType.none,
      });
      expect(await service.getBiometryType()).toBe('faceId');
    });

    it('getBiometryType() maps touchId', async () => {
      mockPlugin.checkBiometry.and.resolveTo({
        isAvailable: true,
        strongBiometryIsAvailable: true,
        biometryType: BiometryType.touchId,
        biometryTypes: [BiometryType.touchId],
        deviceIsSecure: true,
        reason: '',
        code: BiometryErrorType.none,
      });
      expect(await service.getBiometryType()).toBe('touchId');
    });

    it('getBiometryType() maps Android fingerprint', async () => {
      mockPlugin.checkBiometry.and.resolveTo({
        isAvailable: true,
        strongBiometryIsAvailable: true,
        biometryType: BiometryType.fingerprintAuthentication,
        biometryTypes: [BiometryType.fingerprintAuthentication],
        deviceIsSecure: true,
        reason: '',
        code: BiometryErrorType.none,
      });
      expect(await service.getBiometryType()).toBe('fingerprint');
    });

    it('getBiometryType() returns none on unknown / no biometry', async () => {
      mockPlugin.checkBiometry.and.resolveTo({
        isAvailable: false,
        strongBiometryIsAvailable: false,
        biometryType: BiometryType.none,
        biometryTypes: [],
        deviceIsSecure: false,
        reason: '',
        code: BiometryErrorType.biometryNotAvailable,
      });
      expect(await service.getBiometryType()).toBe('none');
    });

    it('getBiometryType() swallows plugin errors', async () => {
      mockPlugin.checkBiometry.and.rejectWith(new Error('boom'));
      expect(await service.getBiometryType()).toBe('none');
    });

    it('authenticate() returns true on success', async () => {
      const result = await service.authenticate('Connecte-toi');
      expect(result).toBeTrue();
      expect(mockPlugin.authenticate).toHaveBeenCalledWith(
        jasmine.objectContaining({ reason: 'Connecte-toi' }),
      );
    });

    it('authenticate() returns false on user cancel / failure', async () => {
      mockPlugin.authenticate.and.rejectWith(
        new Error('user cancelled'),
      );
      const result = await service.authenticate('Reason');
      expect(result).toBeFalse();
    });
  });
});
