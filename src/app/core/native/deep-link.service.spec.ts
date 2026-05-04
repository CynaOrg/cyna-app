import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import type { URLOpenListenerEvent } from '@capacitor/app';
import { DeepLinkService } from './deep-link.service';
import { AppLifecycleService } from './app-lifecycle.service';

describe('DeepLinkService', () => {
  let service: DeepLinkService;
  let urlOpen$: Subject<URLOpenListenerEvent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    urlOpen$ = new Subject<URLOpenListenerEvent>();
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        DeepLinkService,
        { provide: AppLifecycleService, useValue: { urlOpen$ } },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(DeepLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('init() is idempotent', () => {
    service.init();
    service.init();
    // No way to observe internals — but we should still be able to
    // dispatch and only navigate once per URL emission.
    urlOpen$.next({ url: 'cyna://catalog' } as URLOpenListenerEvent);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  describe('cyna:// scheme', () => {
    beforeEach(() => service.init());

    it('routes cyna://catalog to /products', () => {
      urlOpen$.next({ url: 'cyna://catalog' } as URLOpenListenerEvent);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('routes cyna://product/:slug to /products/:slug', () => {
      urlOpen$.next({
        url: 'cyna://product/edr-pro',
      } as URLOpenListenerEvent);
      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/products',
        'edr-pro',
      ]);
    });

    it('routes cyna://order/:id to /order/confirmation/:id', () => {
      urlOpen$.next({
        url: 'cyna://order/abc-123',
      } as URLOpenListenerEvent);
      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/order/confirmation',
        'abc-123',
      ]);
    });

    it('routes cyna://account to /dashboard/account', () => {
      urlOpen$.next({ url: 'cyna://account' } as URLOpenListenerEvent);
      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/dashboard/account',
      ]);
    });

    it('ignores cyna:// with an unknown root segment', () => {
      urlOpen$.next({
        url: 'cyna://unknown/foo',
      } as URLOpenListenerEvent);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('ignores cyna://product without a slug', () => {
      urlOpen$.next({ url: 'cyna://product' } as URLOpenListenerEvent);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('handles malformed URL gracefully', () => {
      urlOpen$.next({ url: 'not a url' } as URLOpenListenerEvent);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('universal links', () => {
    beforeEach(() => service.init());

    it('honours https://cyna-app.up.railway.app/products/foo', () => {
      urlOpen$.next({
        url: 'https://cyna-app.up.railway.app/products/edr-pro',
      } as URLOpenListenerEvent);
      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/products',
        'edr-pro',
      ]);
    });

    it('ignores https URLs from foreign hosts', () => {
      urlOpen$.next({
        url: 'https://example.com/products/foo',
      } as URLOpenListenerEvent);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('handle() public API', () => {
    it('returns true on match and navigates', () => {
      const matched = service.handle('cyna://catalog');
      expect(matched).toBeTrue();
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('returns false on null/undefined/empty', () => {
      expect(service.handle(null)).toBeFalse();
      expect(service.handle(undefined)).toBeFalse();
      expect(service.handle('')).toBeFalse();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('returns false on unknown scheme', () => {
      expect(service.handle('mailto:hi@example.com')).toBeFalse();
    });
  });

  it('ngOnDestroy() unsubscribes', () => {
    service.init();
    service.ngOnDestroy();
    urlOpen$.next({ url: 'cyna://catalog' } as URLOpenListenerEvent);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
