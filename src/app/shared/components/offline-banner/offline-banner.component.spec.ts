import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OfflineBannerComponent } from './offline-banner.component';
import { NetworkService } from '@core/native';

describe('OfflineBannerComponent', () => {
  let fixture: ComponentFixture<OfflineBannerComponent>;
  let isOnline: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isOnline = signal(true);
    const networkMock = { isOnline };

    await TestBed.configureTestingModule({
      imports: [OfflineBannerComponent, TranslateModule.forRoot()],
      providers: [{ provide: NetworkService, useValue: networkMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineBannerComponent);
  });

  it('renders nothing when online', () => {
    isOnline.set(true);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.offline-banner');
    expect(banner).toBeNull();
  });

  it('renders the banner when offline', () => {
    isOnline.set(false);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.offline-banner');
    expect(banner).not.toBeNull();
  });

  it('has role=status for accessibility', () => {
    isOnline.set(false);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.offline-banner');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
  });

  it('disappears when network comes back', () => {
    isOnline.set(false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.offline-banner'),
    ).not.toBeNull();
    isOnline.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.offline-banner')).toBeNull();
  });
});
