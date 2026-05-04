import { TestBed } from '@angular/core/testing';
import { AppLifecycleService } from './app-lifecycle.service';
import { NativePlatformService } from './native-platform.service';
import { APP_PLUGIN } from './plugins.tokens';

describe('AppLifecycleService', () => {
  let service: AppLifecycleService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: { addListener: jasmine.Spy };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      addListener: jasmine
        .createSpy('addListener')
        .and.resolveTo({ remove: () => Promise.resolve() }),
    };
    TestBed.configureTestingModule({
      providers: [
        AppLifecycleService,
        { provide: NativePlatformService, useValue: platform },
        { provide: APP_PLUGIN, useValue: plugin },
      ],
    });
    service = TestBed.inject(AppLifecycleService);
  });

  it('does not register listeners in the browser', async () => {
    platform.isNative.and.returnValue(false);
    await service.init();
    expect(plugin.addListener).not.toHaveBeenCalled();
  });

  it('forwards appUrlOpen events on native', async () => {
    platform.isNative.and.returnValue(true);
    const handlers: Record<string, (e: any) => void> = {};
    plugin.addListener.and.callFake((eventName: string, cb: any) => {
      handlers[eventName] = cb;
      return Promise.resolve({ remove: () => Promise.resolve() });
    });

    await service.init();

    let received: { url?: string } | undefined;
    service.urlOpen$.subscribe((e) => (received = e));
    handlers['appUrlOpen']?.({ url: 'cyna://catalog' });

    expect(received?.url).toBe('cyna://catalog');
  });

  it('init is idempotent', async () => {
    platform.isNative.and.returnValue(true);
    await service.init();
    await service.init();
    expect(plugin.addListener).toHaveBeenCalledTimes(3);
  });
});
