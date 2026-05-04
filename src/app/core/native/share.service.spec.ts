import { TestBed } from '@angular/core/testing';
import {
  ShareService,
  SHARE_PLUGIN,
  WEB_SHARE_ADAPTER,
} from './share.service';
import { NativePlatformService } from './native-platform.service';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

function createMockShare() {
  return {
    share: jasmine.createSpy('share').and.resolveTo({ activityType: 'mail' }),
    canShare: jasmine.createSpy('canShare').and.resolveTo({ value: true }),
  };
}

interface MockedWebAdapter {
  canShare: jasmine.Spy;
  share: jasmine.Spy;
  copyToClipboard: jasmine.Spy;
}

function createMockWebAdapter(): MockedWebAdapter {
  return {
    canShare: jasmine.createSpy('canShare').and.returnValue(false),
    share: jasmine.createSpy('share').and.resolveTo(),
    copyToClipboard: jasmine.createSpy('copyToClipboard').and.resolveTo(true),
  };
}

describe('ShareService', () => {
  let service: ShareService;
  let platform: MockNativePlatformService;
  let mockShare: ReturnType<typeof createMockShare>;
  let mockWeb: ReturnType<typeof createMockWebAdapter>;

  beforeEach(() => {
    platform = new MockNativePlatformService();
    mockShare = createMockShare();
    mockWeb = createMockWebAdapter();

    TestBed.configureTestingModule({
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: SHARE_PLUGIN, useValue: mockShare },
        { provide: WEB_SHARE_ADAPTER, useValue: mockWeb },
      ],
    });
    service = TestBed.inject(ShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('calls the native plugin and returns true', async () => {
      const result = await service.share({
        title: 'Hello',
        text: 'World',
        url: 'https://example.com',
        dialogTitle: 'Share this',
      });
      expect(result).toBeTrue();
      expect(mockShare.share).toHaveBeenCalledWith({
        title: 'Hello',
        text: 'World',
        url: 'https://example.com',
        dialogTitle: 'Share this',
      });
    });

    it('falls back to web share when native sheet rejects', async () => {
      mockShare.share.and.rejectWith(new Error('user cancelled'));
      mockWeb.canShare.and.returnValue(true);
      const result = await service.share({ url: 'https://example.com' });
      expect(result).toBeTrue();
      expect(mockWeb.share).toHaveBeenCalled();
    });

    it('falls back to clipboard when native and web both fail', async () => {
      mockShare.share.and.rejectWith(new Error('boom'));
      mockWeb.canShare.and.returnValue(false);
      const result = await service.share({ url: 'https://example.com' });
      expect(result).toBeTrue();
      expect(mockWeb.copyToClipboard).toHaveBeenCalledWith(
        'https://example.com',
      );
    });
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('uses navigator.share when available', async () => {
      mockWeb.canShare.and.returnValue(true);
      const result = await service.share({
        title: 'Hi',
        url: 'https://example.com',
      });
      expect(result).toBeTrue();
      expect(mockShare.share).not.toHaveBeenCalled();
      expect(mockWeb.share).toHaveBeenCalledWith({
        title: 'Hi',
        text: undefined,
        url: 'https://example.com',
      });
    });

    it('returns false when user cancels navigator.share', async () => {
      mockWeb.canShare.and.returnValue(true);
      mockWeb.share.and.rejectWith(new Error('cancelled'));
      const result = await service.share({ url: 'https://example.com' });
      expect(result).toBeFalse();
    });

    it('falls back to clipboard when navigator.share unavailable', async () => {
      mockWeb.canShare.and.returnValue(false);
      const result = await service.share({ url: 'https://example.com' });
      expect(result).toBeTrue();
      expect(mockWeb.copyToClipboard).toHaveBeenCalledWith(
        'https://example.com',
      );
    });

    it('clipboard fallback prefers url > text > title', async () => {
      mockWeb.canShare.and.returnValue(false);
      await service.share({ title: 'A', text: 'B' });
      expect(mockWeb.copyToClipboard).toHaveBeenCalledWith('B');
    });

    it('returns false when nothing to share', async () => {
      mockWeb.canShare.and.returnValue(false);
      const result = await service.share({});
      expect(result).toBeFalse();
      expect(mockWeb.copyToClipboard).not.toHaveBeenCalled();
    });

    it('returns false when clipboard copy throws', async () => {
      mockWeb.canShare.and.returnValue(false);
      mockWeb.copyToClipboard.and.rejectWith(new Error('denied'));
      const result = await service.share({ url: 'https://example.com' });
      expect(result).toBeFalse();
    });
  });
});
