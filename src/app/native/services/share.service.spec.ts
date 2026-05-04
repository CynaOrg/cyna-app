import { TestBed } from '@angular/core/testing';
import { ShareService } from './share.service';
import { NativePlatformService } from './native-platform.service';
import { SHARE_PLUGIN } from './plugins.tokens';

describe('ShareService', () => {
  let service: ShareService;
  let platform: jasmine.SpyObj<NativePlatformService>;
  let plugin: { share: jasmine.Spy };

  beforeEach(() => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );
    plugin = {
      share: jasmine.createSpy('share').and.resolveTo({ activityType: '' }),
    };
    TestBed.configureTestingModule({
      providers: [
        ShareService,
        { provide: NativePlatformService, useValue: platform },
        { provide: SHARE_PLUGIN, useValue: plugin },
      ],
    });
    service = TestBed.inject(ShareService);
  });

  it('uses Capacitor Share on native and reports success', async () => {
    platform.isNative.and.returnValue(true);
    const ok = await service.share({ url: 'https://cyna.io' });
    expect(plugin.share).toHaveBeenCalled();
    expect(ok).toBe(true);
  });

  it('falls back to navigator.share on the web', async () => {
    platform.isNative.and.returnValue(false);
    const navShare = jasmine.createSpy('navShare').and.resolveTo();
    (navigator as any).share = navShare;
    const ok = await service.share({ url: 'https://cyna.io' });
    expect(navShare).toHaveBeenCalled();
    expect(ok).toBe(true);
    delete (navigator as any).share;
  });

  it('falls back to clipboard when navigator.share is missing', async () => {
    platform.isNative.and.returnValue(false);
    delete (navigator as any).share;
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({
      writeText,
    } as unknown as Clipboard);
    const ok = await service.share({ url: 'https://cyna.io' });
    expect(writeText).toHaveBeenCalledWith('https://cyna.io');
    expect(ok).toBe(true);
  });

  it('returns false when no fallback is available', async () => {
    platform.isNative.and.returnValue(false);
    delete (navigator as any).share;
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue(
      undefined as unknown as Clipboard,
    );
    const ok = await service.share({});
    expect(ok).toBe(false);
  });
});
