import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppLifecycleService } from './app-lifecycle.service';
import { APP_PLUGIN, NativePlatformService } from './native-platform.service';

type Listener = (event: any) => void;

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockApp(
  registered: Map<string, Listener>,
  removeSpy: jasmine.Spy,
) {
  return {
    addListener: jasmine
      .createSpy('addListener')
      .and.callFake((eventName: any, listener: any) => {
        registered.set(eventName, listener as Listener);
        return Promise.resolve({ remove: removeSpy });
      }),
    exitApp: jasmine.createSpy('exitApp').and.resolveTo(),
    getInfo: jasmine.createSpy('getInfo').and.resolveTo({}),
    getLaunchUrl: jasmine.createSpy('getLaunchUrl').and.resolveTo(undefined),
    getState: jasmine
      .createSpy('getState')
      .and.resolveTo({ isActive: true } as any),
    minimizeApp: jasmine.createSpy('minimizeApp').and.resolveTo(),
    removeAllListeners: jasmine.createSpy('removeAllListeners').and.resolveTo(),
  };
}

describe('AppLifecycleService', () => {
  let service: AppLifecycleService;
  let platform: MockNativePlatformService;
  let registeredListeners: Map<string, Listener>;
  let removeSpy: jasmine.Spy;
  let mockApp: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    platform = new MockNativePlatformService();
    registeredListeners = new Map();
    removeSpy = jasmine.createSpy('remove').and.resolveTo();
    mockApp = createMockApp(registeredListeners, removeSpy);

    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: APP_PLUGIN, useValue: mockApp },
      ],
    });
    service = TestBed.inject(AppLifecycleService);
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('init() registers no listeners on web', async () => {
      await service.init();
      expect(mockApp.addListener).not.toHaveBeenCalled();
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('init() registers appUrlOpen, appStateChange and backButton listeners', async () => {
      await service.init();
      expect(mockApp.addListener).toHaveBeenCalledTimes(3);
      expect(registeredListeners.has('appUrlOpen')).toBeTrue();
      expect(registeredListeners.has('appStateChange')).toBeTrue();
      expect(registeredListeners.has('backButton')).toBeTrue();
    });

    it('init() is idempotent', async () => {
      await service.init();
      await service.init();
      expect(mockApp.addListener).toHaveBeenCalledTimes(3);
    });

    it('emits on urlOpen$ when native event fires', fakeAsync(async () => {
      await service.init();
      tick();
      const emissions: any[] = [];
      service.urlOpen$.subscribe((event) => emissions.push(event));

      const urlListener = registeredListeners.get('appUrlOpen');
      urlListener?.({ url: 'cyna://product/foo' });

      expect(emissions.length).toBe(1);
      expect(emissions[0].url).toBe('cyna://product/foo');
    }));

    it('emits on stateChange$ when native event fires', fakeAsync(async () => {
      await service.init();
      tick();
      const emissions: any[] = [];
      service.stateChange$.subscribe((state) => emissions.push(state));

      const stateListener = registeredListeners.get('appStateChange');
      stateListener?.({ isActive: false });

      expect(emissions.length).toBe(1);
      expect(emissions[0].isActive).toBeFalse();
    }));

    it('emits on backButton$ when native event fires', fakeAsync(async () => {
      await service.init();
      tick();
      const emissions: number[] = [];
      service.backButton$.subscribe(() => emissions.push(1));

      const backListener = registeredListeners.get('backButton');
      backListener?.({});

      expect(emissions.length).toBe(1);
    }));

    it('ngOnDestroy() removes all native listeners', async () => {
      await service.init();
      service.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledTimes(3);
    });

    it('ngOnDestroy() completes the subjects', async () => {
      await service.init();
      let urlCompleted = false;
      let stateCompleted = false;
      let backCompleted = false;
      service.urlOpen$.subscribe({ complete: () => (urlCompleted = true) });
      service.stateChange$.subscribe({
        complete: () => (stateCompleted = true),
      });
      service.backButton$.subscribe({ complete: () => (backCompleted = true) });

      service.ngOnDestroy();

      expect(urlCompleted).toBeTrue();
      expect(stateCompleted).toBeTrue();
      expect(backCompleted).toBeTrue();
    });

    it('swallows errors from addListener', async () => {
      mockApp.addListener.and.rejectWith(new Error('plugin missing'));
      await expectAsync(service.init()).toBeResolved();
    });
  });
});
