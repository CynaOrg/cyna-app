import { TestBed } from '@angular/core/testing';
import { Style } from '@capacitor/status-bar';
import { StatusBarService } from './status-bar.service';
import { NativePlatformService } from './native-platform.service';
import { STATUS_BAR_PLUGIN } from './plugins.tokens';

describe('StatusBarService', () => {
  let service: StatusBarService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: {
    setStyle: jasmine.Spy;
    setBackgroundColor: jasmine.Spy;
  };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      setStyle: jasmine.createSpy('setStyle').and.resolveTo(),
      setBackgroundColor: jasmine
        .createSpy('setBackgroundColor')
        .and.resolveTo(),
    };
    TestBed.configureTestingModule({
      providers: [
        StatusBarService,
        { provide: NativePlatformService, useValue: platform },
        { provide: STATUS_BAR_PLUGIN, useValue: plugin },
      ],
    });
    service = TestBed.inject(StatusBarService);
  });

  it('does nothing in the browser', async () => {
    platform.isNative.and.returnValue(false);
    await service.init();
    expect(plugin.setStyle).not.toHaveBeenCalled();
    expect(plugin.setBackgroundColor).not.toHaveBeenCalled();
  });

  it('sets brand colour and light style on native init', async () => {
    platform.isNative.and.returnValue(true);
    await service.init();
    expect(plugin.setStyle).toHaveBeenCalledWith({ style: Style.Light });
    expect(plugin.setBackgroundColor).toHaveBeenCalledWith({
      color: '#4f39f6',
    });
  });

  it('flips icon contrast via setDark', async () => {
    platform.isNative.and.returnValue(true);
    await service.setDark();
    expect(plugin.setStyle).toHaveBeenCalledWith({ style: Style.Dark });
  });

  it('swallows plugin errors during init', async () => {
    platform.isNative.and.returnValue(true);
    plugin.setStyle.and.rejectWith(new Error('nope'));
    await expectAsync(service.init()).toBeResolved();
  });
});
