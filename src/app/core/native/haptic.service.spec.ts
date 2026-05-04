import { TestBed } from '@angular/core/testing';
import { HapticService } from './haptic.service';
import {
  HAPTICS_PLUGIN,
  NativePlatformService,
} from './native-platform.service';
import { ImpactStyle } from '@capacitor/haptics';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockHaptics() {
  return {
    impact: jasmine.createSpy('impact').and.resolveTo(),
    selectionStart: jasmine.createSpy('selectionStart').and.resolveTo(),
    selectionChanged: jasmine.createSpy('selectionChanged').and.resolveTo(),
    selectionEnd: jasmine.createSpy('selectionEnd').and.resolveTo(),
    notification: jasmine.createSpy('notification').and.resolveTo(),
    vibrate: jasmine.createSpy('vibrate').and.resolveTo(),
  };
}

describe('HapticService', () => {
  let service: HapticService;
  let platform: MockNativePlatformService;
  let mockHaptics: ReturnType<typeof createMockHaptics>;

  beforeEach(() => {
    platform = new MockNativePlatformService();
    mockHaptics = createMockHaptics();
    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: HAPTICS_PLUGIN, useValue: mockHaptics },
      ],
    });
    service = TestBed.inject(HapticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('light() does nothing on web', async () => {
      await service.light();
      expect(mockHaptics.impact).not.toHaveBeenCalled();
    });

    it('medium() does nothing on web', async () => {
      await service.medium();
      expect(mockHaptics.impact).not.toHaveBeenCalled();
    });

    it('heavy() does nothing on web', async () => {
      await service.heavy();
      expect(mockHaptics.impact).not.toHaveBeenCalled();
    });

    it('selection() does nothing on web', async () => {
      await service.selection();
      expect(mockHaptics.selectionStart).not.toHaveBeenCalled();
      expect(mockHaptics.selectionChanged).not.toHaveBeenCalled();
      expect(mockHaptics.selectionEnd).not.toHaveBeenCalled();
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('light() triggers Light impact', async () => {
      await service.light();
      expect(mockHaptics.impact).toHaveBeenCalledWith({
        style: ImpactStyle.Light,
      });
    });

    it('medium() triggers Medium impact', async () => {
      await service.medium();
      expect(mockHaptics.impact).toHaveBeenCalledWith({
        style: ImpactStyle.Medium,
      });
    });

    it('heavy() triggers Heavy impact', async () => {
      await service.heavy();
      expect(mockHaptics.impact).toHaveBeenCalledWith({
        style: ImpactStyle.Heavy,
      });
    });

    it('selection() chains start/changed/end', async () => {
      await service.selection();
      expect(mockHaptics.selectionStart).toHaveBeenCalledTimes(1);
      expect(mockHaptics.selectionChanged).toHaveBeenCalledTimes(1);
      expect(mockHaptics.selectionEnd).toHaveBeenCalledTimes(1);
    });

    it('swallows errors thrown by the plugin', async () => {
      mockHaptics.impact.and.rejectWith(new Error('plugin missing'));
      await expectAsync(service.light()).toBeResolved();
      await expectAsync(service.medium()).toBeResolved();
      await expectAsync(service.heavy()).toBeResolved();
    });

    it('swallows errors during selection chain', async () => {
      mockHaptics.selectionStart.and.rejectWith(new Error('plugin missing'));
      await expectAsync(service.selection()).toBeResolved();
    });
  });
});
