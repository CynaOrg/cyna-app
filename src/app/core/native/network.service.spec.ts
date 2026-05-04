import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  NetworkService,
  NETWORK_PLUGIN,
  BROWSER_NETWORK_ADAPTER,
  BrowserNetworkAdapter,
} from './network.service';
import { NativePlatformService } from './native-platform.service';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockNetwork(initial = { connected: true, connectionType: 'wifi' as const }) {
  let listener: ((status: any) => void) | null = null;
  const removeSpy = jasmine.createSpy('remove').and.resolveTo();
  return {
    listener: () => listener,
    fire: (status: any) => listener?.(status),
    removeSpy,
    plugin: {
      getStatus: jasmine.createSpy('getStatus').and.resolveTo(initial),
      addListener: jasmine
        .createSpy('addListener')
        .and.callFake((_event: string, cb: any) => {
          listener = cb;
          return Promise.resolve({ remove: removeSpy });
        }),
      removeAllListeners: jasmine.createSpy('removeAllListeners').and.resolveTo(),
    },
  };
}

function createMockBrowser(
  initialOnline = true,
): BrowserNetworkAdapter & {
  online?: () => void;
  offline?: () => void;
  set: (online: boolean) => void;
} {
  let online = initialOnline;
  const handlers = new Map<string, () => void>();
  return {
    isOnline: () => online,
    addEventListener: jasmine
      .createSpy('addEventListener')
      .and.callFake((event: string, cb: () => void) => {
        handlers.set(event, cb);
      }),
    removeEventListener: jasmine
      .createSpy('removeEventListener')
      .and.callFake((event: string) => {
        handlers.delete(event);
      }),
    get online() {
      return handlers.get('online');
    },
    get offline() {
      return handlers.get('offline');
    },
    set: (next: boolean) => {
      online = next;
    },
  } as any;
}

describe('NetworkService', () => {
  let service: NetworkService;
  let platform: MockNativePlatformService;
  let mockNetwork: ReturnType<typeof createMockNetwork>;
  let mockBrowser: ReturnType<typeof createMockBrowser>;

  function configure() {
    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: NETWORK_PLUGIN, useValue: mockNetwork.plugin },
        { provide: BROWSER_NETWORK_ADAPTER, useValue: mockBrowser },
      ],
    });
    service = TestBed.inject(NetworkService);
  }

  beforeEach(() => {
    platform = new MockNativePlatformService();
    mockNetwork = createMockNetwork();
    mockBrowser = createMockBrowser(true);
  });

  it('should be created', () => {
    configure();
    expect(service).toBeTruthy();
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('init() seeds initial state from getStatus() and registers a listener', async () => {
      configure();
      await service.init();
      expect(mockNetwork.plugin.getStatus).toHaveBeenCalled();
      expect(mockNetwork.plugin.addListener).toHaveBeenCalledWith(
        'networkStatusChange',
        jasmine.any(Function),
      );
      expect(service.isOnline()).toBeTrue();
    });

    it('updates state when the native event fires offline', fakeAsync(async () => {
      configure();
      await service.init();
      tick();
      mockNetwork.fire({ connected: false, connectionType: 'none' });
      expect(service.isOnline()).toBeFalse();
    }));

    it('isOnline$ emits boolean transitions', fakeAsync(async () => {
      configure();
      await service.init();
      tick();
      const values: boolean[] = [];
      service.isOnline$.subscribe((v) => values.push(v));
      mockNetwork.fire({ connected: false, connectionType: 'none' });
      mockNetwork.fire({ connected: true, connectionType: 'wifi' });
      expect(values).toEqual([true, false, true]);
    }));

    it('init() is idempotent', async () => {
      configure();
      await service.init();
      await service.init();
      expect(mockNetwork.plugin.getStatus).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy() removes the listener', async () => {
      configure();
      await service.init();
      service.ngOnDestroy();
      expect(mockNetwork.removeSpy).toHaveBeenCalled();
    });

    it('falls back to online=true when getStatus rejects', async () => {
      mockNetwork.plugin.getStatus.and.rejectWith(new Error('boom'));
      configure();
      await service.init();
      expect(service.isOnline()).toBeTrue();
    });
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('init() seeds isOnline from navigator.onLine', async () => {
      mockBrowser.set(true);
      configure();
      await service.init();
      expect(service.isOnline()).toBeTrue();
    });

    it('init() seeds offline correctly', async () => {
      mockBrowser.set(false);
      configure();
      await service.init();
      expect(service.isOnline()).toBeFalse();
    });

    it('updates on offline event', async () => {
      configure();
      await service.init();
      mockBrowser.offline?.();
      expect(service.isOnline()).toBeFalse();
    });

    it('updates on online event', async () => {
      mockBrowser.set(false);
      configure();
      await service.init();
      mockBrowser.online?.();
      expect(service.isOnline()).toBeTrue();
    });

    it('ngOnDestroy() removes browser listeners', async () => {
      configure();
      await service.init();
      service.ngOnDestroy();
      expect(mockBrowser.removeEventListener).toHaveBeenCalledWith(
        'online',
        jasmine.any(Function),
      );
      expect(mockBrowser.removeEventListener).toHaveBeenCalledWith(
        'offline',
        jasmine.any(Function),
      );
    });

    it('does not call native plugin', async () => {
      configure();
      await service.init();
      expect(mockNetwork.plugin.getStatus).not.toHaveBeenCalled();
      expect(mockNetwork.plugin.addListener).not.toHaveBeenCalled();
    });

    it('exposes the latest state via state$', async () => {
      mockBrowser.set(false);
      configure();
      await service.init();
      const state = await firstValueFrom(service.state$);
      expect(state.isOnline).toBeFalse();
      expect(state.connectionType).toBe('none');
    });
  });
});
