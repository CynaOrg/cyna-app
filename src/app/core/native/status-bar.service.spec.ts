import { TestBed } from '@angular/core/testing';
import { StatusBarService } from './status-bar.service';
import {
  NativePlatformService,
  STATUS_BAR_PLUGIN,
} from './native-platform.service';
import { Style } from '@capacitor/status-bar';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockStatusBar() {
  return {
    setStyle: jasmine.createSpy('setStyle').and.resolveTo(),
    setOverlaysWebView: jasmine.createSpy('setOverlaysWebView').and.resolveTo(),
    setBackgroundColor: jasmine.createSpy('setBackgroundColor').and.resolveTo(),
    show: jasmine.createSpy('show').and.resolveTo(),
    hide: jasmine.createSpy('hide').and.resolveTo(),
    getInfo: jasmine.createSpy('getInfo').and.resolveTo({}),
  };
}

describe('StatusBarService', () => {
  let service: StatusBarService;
  let platform: MockNativePlatformService;
  let mockStatusBar: ReturnType<typeof createMockStatusBar>;

  beforeEach(() => {
    platform = new MockNativePlatformService();
    mockStatusBar = createMockStatusBar();
    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: STATUS_BAR_PLUGIN, useValue: mockStatusBar },
      ],
    });
    service = TestBed.inject(StatusBarService);
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('init() does nothing on web', async () => {
      await service.init();
      expect(mockStatusBar.setStyle).not.toHaveBeenCalled();
      expect(mockStatusBar.setOverlaysWebView).not.toHaveBeenCalled();
    });

    it('setLight() does nothing on web', async () => {
      await service.setLight();
      expect(mockStatusBar.setStyle).not.toHaveBeenCalled();
    });

    it('setDark() does nothing on web', async () => {
      await service.setDark();
      expect(mockStatusBar.setStyle).not.toHaveBeenCalled();
    });

    it('setColor() does nothing on web', async () => {
      await service.setColor('#1447E6');
      expect(mockStatusBar.setBackgroundColor).not.toHaveBeenCalled();
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('init() applies default style and enables overlay', async () => {
      await service.init();
      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({
        style: Style.Default,
      });
      expect(mockStatusBar.setOverlaysWebView).toHaveBeenCalledWith({
        overlay: true,
      });
    });

    it('setLight() switches to Light style', async () => {
      await service.setLight();
      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({
        style: Style.Light,
      });
    });

    it('setDark() switches to Dark style', async () => {
      await service.setDark();
      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({
        style: Style.Dark,
      });
    });

    it('setColor() forwards the hex value', async () => {
      await service.setColor('#1447E6');
      expect(mockStatusBar.setBackgroundColor).toHaveBeenCalledWith({
        color: '#1447E6',
      });
    });

    it('swallows errors from setStyle', async () => {
      mockStatusBar.setStyle.and.rejectWith(new Error('not available'));
      await expectAsync(service.init()).toBeResolved();
      await expectAsync(service.setLight()).toBeResolved();
      await expectAsync(service.setDark()).toBeResolved();
    });

    it('swallows errors from setColor (iOS rejects)', async () => {
      mockStatusBar.setBackgroundColor.and.rejectWith(
        new Error('iOS unsupported'),
      );
      await expectAsync(service.setColor('#000000')).toBeResolved();
    });
  });
});
