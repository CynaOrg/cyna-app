import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';
import { NativePlatformService } from './native-platform.service';
import { NETWORK_PLUGIN } from './plugins.tokens';

describe('NetworkService', () => {
  let service: NetworkService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: { getStatus: jasmine.Spy; addListener: jasmine.Spy };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      getStatus: jasmine
        .createSpy('getStatus')
        .and.resolveTo({ connected: true, connectionType: 'wifi' }),
      addListener: jasmine
        .createSpy('addListener')
        .and.resolveTo({ remove: () => Promise.resolve() }),
    };
  });

  function build(): NetworkService {
    TestBed.configureTestingModule({
      providers: [
        NetworkService,
        { provide: NativePlatformService, useValue: platform },
        { provide: NETWORK_PLUGIN, useValue: plugin },
      ],
    });
    return TestBed.inject(NetworkService);
  }

  it('initialises from navigator.onLine on the web', async () => {
    platform.isNative.and.returnValue(false);
    spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
    service = build();
    await service.init();
    expect(service.isOnline()).toBe(false);
  });

  it('reacts to web online/offline events', async () => {
    platform.isNative.and.returnValue(false);
    spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
    service = build();
    await service.init();
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
  });

  it('reads the initial Capacitor status on native', async () => {
    platform.isNative.and.returnValue(true);
    plugin.getStatus.and.resolveTo({
      connected: false,
      connectionType: 'none',
    });
    service = build();
    await service.init();
    expect(service.isOnline()).toBe(false);
  });

  it('init is idempotent', async () => {
    platform.isNative.and.returnValue(false);
    service = build();
    await service.init();
    await service.init();
    expect(service.isOnline()).toBe(navigator.onLine);
  });
});
