import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ExternalLinkDirective } from './external-link.directive';
import { NativePlatformService } from '../services/native-platform.service';

@Component({
  standalone: true,
  imports: [ExternalLinkDirective],
  template: `<a appExternalLink [attr.href]="href">Open</a>`,
})
class HostComponent {
  href = 'https://cyna.app/about';
}

@Component({
  standalone: true,
  imports: [ExternalLinkDirective],
  template: `<button appExternalLink>Hi</button>`,
})
class NoHrefHostComponent {}

describe('ExternalLinkDirective', () => {
  let platform: jasmine.SpyObj<NativePlatformService>;

  beforeEach(async () => {
    platform = jasmine.createSpyObj<NativePlatformService>(
      'NativePlatformService',
      ['isNative'],
    );

    await TestBed.configureTestingModule({
      imports: [HostComponent, NoHrefHostComponent],
      providers: [{ provide: NativePlatformService, useValue: platform }],
    }).compileComponents();
  });

  function getDirective<T>(type: Type<T>): {
    directive: ExternalLinkDirective;
    eventFor: () => MouseEvent;
  } {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(
      By.directive(ExternalLinkDirective),
    );
    const directive = debugEl.injector.get(
      ExternalLinkDirective,
    ) as ExternalLinkDirective;
    const eventFor = (): MouseEvent =>
      new MouseEvent('click', { bubbles: true, cancelable: true });
    return { directive, eventFor };
  }

  it('opens via Capacitor Browser on native and prevents default', async () => {
    platform.isNative.and.returnValue(true);
    const { directive, eventFor } = getDirective(HostComponent);
    const browserSpy = spyOn<any>(directive, 'openInAppBrowser').and.resolveTo();
    const tabSpy = spyOn<any>(directive, 'openInNewTab');
    const event = eventFor();
    await directive.onClick(event);
    expect(event.defaultPrevented).toBe(true);
    expect(browserSpy).toHaveBeenCalledWith('https://cyna.app/about');
    expect(tabSpy).not.toHaveBeenCalled();
  });

  it('falls back to a new tab on web', async () => {
    platform.isNative.and.returnValue(false);
    const { directive, eventFor } = getDirective(HostComponent);
    const browserSpy = spyOn<any>(directive, 'openInAppBrowser').and.resolveTo();
    const tabSpy = spyOn<any>(directive, 'openInNewTab');
    const event = eventFor();
    await directive.onClick(event);
    expect(event.defaultPrevented).toBe(true);
    expect(browserSpy).not.toHaveBeenCalled();
    expect(tabSpy).toHaveBeenCalledWith('https://cyna.app/about');
  });

  it('falls back to a new tab when the in-app browser rejects', async () => {
    platform.isNative.and.returnValue(true);
    const { directive, eventFor } = getDirective(HostComponent);
    const browserSpy = spyOn<any>(directive, 'openInAppBrowser').and.rejectWith(
      new Error('plugin missing'),
    );
    const tabSpy = spyOn<any>(directive, 'openInNewTab');
    await directive.onClick(eventFor());
    expect(browserSpy).toHaveBeenCalled();
    expect(tabSpy).toHaveBeenCalledWith('https://cyna.app/about');
  });

  it('does nothing when there is no href', async () => {
    platform.isNative.and.returnValue(false);
    const { directive, eventFor } = getDirective(NoHrefHostComponent);
    const browserSpy = spyOn<any>(directive, 'openInAppBrowser');
    const tabSpy = spyOn<any>(directive, 'openInNewTab');
    const event = eventFor();
    await directive.onClick(event);
    expect(event.defaultPrevented).toBe(false);
    expect(browserSpy).not.toHaveBeenCalled();
    expect(tabSpy).not.toHaveBeenCalled();
  });
});
