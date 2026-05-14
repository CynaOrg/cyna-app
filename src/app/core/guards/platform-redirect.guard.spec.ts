import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { browserOnlyGuard, nativeOnlyGuard } from './platform-redirect.guard';

describe('platform-redirect guards', () => {
  let router: jasmine.SpyObj<Router>;
  let originalCap: unknown;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    originalCap = (window as any).Capacitor;

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
  });

  afterEach(() => {
    if (originalCap === undefined) delete (window as any).Capacitor;
    else (window as any).Capacitor = originalCap;
  });

  const setNative = (native: boolean): void => {
    if (native) {
      (window as any).Capacitor = { PluginHeaders: [{ name: 'x' }] };
    } else {
      delete (window as any).Capacitor;
    }
  };

  it('nativeOnlyGuard allows access on native', () => {
    setNative(true);
    const result = TestBed.runInInjectionContext(() =>
      nativeOnlyGuard(null as never, null as never),
    );
    expect(result).toBeTrue();
  });

  it('nativeOnlyGuard redirects to /landing on web', () => {
    setNative(false);
    TestBed.runInInjectionContext(() =>
      nativeOnlyGuard(null as never, null as never),
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/landing']);
  });

  it('browserOnlyGuard allows access on web', () => {
    setNative(false);
    const result = TestBed.runInInjectionContext(() =>
      browserOnlyGuard(null as never, null as never),
    );
    expect(result).toBeTrue();
  });

  it('browserOnlyGuard redirects to /home on native', () => {
    setNative(true);
    TestBed.runInInjectionContext(() =>
      browserOnlyGuard(null as never, null as never),
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
  });
});
