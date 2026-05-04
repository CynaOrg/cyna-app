import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { URLOpenListenerEvent } from '@capacitor/app';
import { DeepLinkService } from './deep-link.service';
import { AppLifecycleService } from './app-lifecycle.service';
import { NativePlatformService } from './native-platform.service';

describe('DeepLinkService', () => {
  let service: DeepLinkService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let lifecycle: { urlOpen$: Subject<URLOpenListenerEvent>; init: jasmine.Spy };
  let router: Router;

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    lifecycle = {
      urlOpen$: new Subject<URLOpenListenerEvent>(),
      init: jasmine.createSpy('init').and.resolveTo(),
    };
    TestBed.configureTestingModule({
      providers: [
        DeepLinkService,
        provideRouter([]),
        { provide: NativePlatformService, useValue: platform },
        { provide: AppLifecycleService, useValue: lifecycle },
      ],
    });
    service = TestBed.inject(DeepLinkService);
    router = TestBed.inject(Router);
  });

  describe('resolve()', () => {
    it('maps the well-known schemes', () => {
      expect(service.resolve('cyna://catalog')).toBe('/m/catalog');
      expect(service.resolve('cyna://product/edr-pro')).toBe(
        '/m/products/edr-pro',
      );
      expect(service.resolve('cyna://order/abc-123')).toBe(
        '/m/dashboard/orders/abc-123',
      );
      expect(service.resolve('cyna://account')).toBe('/m/dashboard/account');
    });

    it('returns null for unknown or malformed URLs', () => {
      expect(service.resolve('https://cyna.io')).toBeNull();
      expect(service.resolve('cyna://unknown')).toBeNull();
      expect(service.resolve('not a url')).toBeNull();
      expect(service.resolve('cyna://product')).toBeNull();
    });
  });

  it('navigates the router on a recognised URL', async () => {
    platform.isNative.and.returnValue(true);
    const navSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    await service.init();
    lifecycle.urlOpen$.next({
      url: 'cyna://catalog',
    } as URLOpenListenerEvent);
    expect(navSpy).toHaveBeenCalledWith('/m/catalog');
  });

  it('does nothing on the web', async () => {
    platform.isNative.and.returnValue(false);
    const navSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    await service.init();
    lifecycle.urlOpen$.next({
      url: 'cyna://catalog',
    } as URLOpenListenerEvent);
    expect(lifecycle.init).not.toHaveBeenCalled();
    expect(navSpy).not.toHaveBeenCalled();
  });
});
