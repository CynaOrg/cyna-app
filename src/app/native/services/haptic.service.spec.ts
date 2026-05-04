import { TestBed } from '@angular/core/testing';
import { ImpactStyle } from '@capacitor/haptics';
import { HapticService } from './haptic.service';
import { NativePlatformService } from './native-platform.service';
import { HAPTICS_PLUGIN } from './plugins.tokens';

describe('HapticService', () => {
  let service: HapticService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: {
    impact: jasmine.Spy;
    selectionStart: jasmine.Spy;
    selectionEnd: jasmine.Spy;
  };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      impact: jasmine.createSpy('impact').and.resolveTo(),
      selectionStart: jasmine.createSpy('selectionStart').and.resolveTo(),
      selectionEnd: jasmine.createSpy('selectionEnd').and.resolveTo(),
    };
    TestBed.configureTestingModule({
      providers: [
        HapticService,
        { provide: NativePlatformService, useValue: platform },
        { provide: HAPTICS_PLUGIN, useValue: plugin },
      ],
    });
    service = TestBed.inject(HapticService);
  });

  it('skips Haptics.impact in the browser', async () => {
    platform.isNative.and.returnValue(false);
    await service.light();
    await service.medium();
    await service.heavy();
    expect(plugin.impact).not.toHaveBeenCalled();
  });

  it('calls Haptics.impact with the right style on native', async () => {
    platform.isNative.and.returnValue(true);
    await service.medium();
    expect(plugin.impact).toHaveBeenCalledOnceWith({
      style: ImpactStyle.Medium,
    });
  });

  it('swallows plugin errors so callers never crash', async () => {
    platform.isNative.and.returnValue(true);
    plugin.impact.and.rejectWith(new Error('boom'));
    await expectAsync(service.heavy()).toBeResolved();
  });

  it('runs selection start/end on native', async () => {
    platform.isNative.and.returnValue(true);
    await service.selection();
    expect(plugin.selectionStart).toHaveBeenCalled();
    expect(plugin.selectionEnd).toHaveBeenCalled();
  });

  it('skips selection in the browser', async () => {
    platform.isNative.and.returnValue(false);
    await service.selection();
    expect(plugin.selectionStart).not.toHaveBeenCalled();
  });
});
