import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { NativeMobileHeaderComponent } from './native-mobile-header.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

describe('NativeMobileHeaderComponent', () => {
  let count$: BehaviorSubject<number>;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    count$ = new BehaviorSubject<number>(0);
    searchService = jasmine.createSpyObj<SearchService>('SearchService', [
      'open',
    ]);

    await TestBed.configureTestingModule({
      imports: [NativeMobileHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: { count$ } },
        { provide: SearchService, useValue: searchService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the header', () => {
    const fixture = TestBed.createComponent(NativeMobileHeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides the cart badge when count is zero', () => {
    const fixture = TestBed.createComponent(NativeMobileHeaderComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.bg-red-600');
    expect(badge).toBeNull();
  });

  it('shows the cart badge with the right count when items are present', () => {
    const fixture = TestBed.createComponent(NativeMobileHeaderComponent);
    count$.next(3);
    fixture.detectChanges();
    const badge: HTMLElement = fixture.nativeElement.querySelector(
      '.bg-red-600',
    );
    expect(badge).not.toBeNull();
    expect(badge.textContent?.trim()).toBe('3');
  });

  it('calls SearchService.open when the search button is clicked', () => {
    const fixture = TestBed.createComponent(NativeMobileHeaderComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Search"]',
    );
    button.click();
    expect(searchService.open).toHaveBeenCalledTimes(1);
  });
});
