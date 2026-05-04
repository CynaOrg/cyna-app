import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ExternalLinkDirective,
  BROWSER_PLUGIN,
} from './external-link.directive';
import { NativePlatformService } from '@core/native';

class MockNativePlatformService {
  native = false;
  isNative(): boolean {
    return this.native;
  }
}

@Component({
  standalone: true,
  imports: [ExternalLinkDirective],
  template: `
    <a id="anchor" appExternalLink href="https://example.com/legal">Legal</a>
    <button
      id="button"
      [appExternalLink]="'https://override.example.com'"
    >
      Custom
    </button>
    <a id="empty" appExternalLink>No href</a>
  `,
})
class HostComponent {}

describe('ExternalLinkDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let platform: MockNativePlatformService;
  let mockBrowser: { open: jasmine.Spy; close: jasmine.Spy };

  beforeEach(async () => {
    platform = new MockNativePlatformService();
    mockBrowser = {
      open: jasmine.createSpy('open').and.resolveTo(),
      close: jasmine.createSpy('close').and.resolveTo(),
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: NativePlatformService, useValue: platform },
        { provide: BROWSER_PLUGIN, useValue: mockBrowser },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function clickAndWait(id: string): Promise<void> {
    const el = fixture.nativeElement.querySelector(`#${id}`);
    el.click();
    return Promise.resolve();
  }

  describe('on native platform', () => {
    beforeEach(() => {
      platform.native = true;
    });

    it('opens the anchor href via Browser plugin', async () => {
      await clickAndWait('anchor');
      await fixture.whenStable();
      expect(mockBrowser.open).toHaveBeenCalledWith({
        url: 'https://example.com/legal',
      });
    });

    it('uses the bound URL when provided explicitly', async () => {
      await clickAndWait('button');
      await fixture.whenStable();
      expect(mockBrowser.open).toHaveBeenCalledWith({
        url: 'https://override.example.com',
      });
    });

    it('does nothing when no URL is available', async () => {
      await clickAndWait('empty');
      await fixture.whenStable();
      expect(mockBrowser.open).not.toHaveBeenCalled();
    });

    it('falls back to window.open when Browser plugin throws', async () => {
      mockBrowser.open.and.rejectWith(new Error('plugin missing'));
      const windowOpen = spyOn(window, 'open').and.returnValue(null);
      await clickAndWait('anchor');
      await fixture.whenStable();
      // Wait microtask for async handler.
      await Promise.resolve();
      await Promise.resolve();
      expect(windowOpen).toHaveBeenCalledWith(
        'https://example.com/legal',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

  describe('on web (non-native)', () => {
    beforeEach(() => {
      platform.native = false;
    });

    it('opens the URL in a new tab via window.open', async () => {
      const windowOpen = spyOn(window, 'open').and.returnValue(null);
      await clickAndWait('anchor');
      await fixture.whenStable();
      expect(windowOpen).toHaveBeenCalledWith(
        'https://example.com/legal',
        '_blank',
        'noopener,noreferrer',
      );
      expect(mockBrowser.open).not.toHaveBeenCalled();
    });
  });
});
