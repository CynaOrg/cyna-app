import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineBannerComponent } from './offline-banner.component';
import { NetworkService } from '../services/network.service';

describe('OfflineBannerComponent', () => {
  let isOnline: ReturnType<typeof signal<boolean>>;
  let fixture: ComponentFixture<OfflineBannerComponent>;

  beforeEach(async () => {
    isOnline = signal(true);
    await TestBed.configureTestingModule({
      imports: [OfflineBannerComponent],
      providers: [
        {
          provide: NetworkService,
          useValue: {
            get isOnline() {
              return isOnline;
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OfflineBannerComponent);
  });

  it('renders nothing while online', () => {
    isOnline.set(true);
    fixture.detectChanges();
    const strip = fixture.nativeElement.querySelector('.offline-banner-strip');
    expect(strip).toBeNull();
  });

  it('renders the strip when offline', () => {
    isOnline.set(false);
    fixture.detectChanges();
    const strip = fixture.nativeElement.querySelector('.offline-banner-strip');
    expect(strip).toBeTruthy();
    expect(strip.textContent).toContain('hors-ligne');
  });

  it('exposes a polite live region for accessibility', () => {
    isOnline.set(false);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it('marks itself aria-hidden when back online', () => {
    isOnline.set(true);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('reacts to connectivity changes', () => {
    isOnline.set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.offline-banner-strip'),
    ).toBeNull();

    isOnline.set(false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.offline-banner-strip'),
    ).toBeTruthy();

    isOnline.set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.offline-banner-strip'),
    ).toBeNull();
  });
});
