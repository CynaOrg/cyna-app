import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { MobileHeaderComponent } from './mobile-header.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

describe('MobileHeaderComponent', () => {
  let fixture: ComponentFixture<MobileHeaderComponent>;
  let component: MobileHeaderComponent;
  let count$: BehaviorSubject<number>;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    count$ = new BehaviorSubject<number>(0);
    searchService = jasmine.createSpyObj<SearchService>('SearchService', [
      'open',
    ]);

    await TestBed.configureTestingModule({
      imports: [MobileHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: { count$ } },
        { provide: SearchService, useValue: searchService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a sticky glassmorphism header that respects the safe-area top', () => {
    const header = fixture.debugElement.query(By.css('header')).nativeElement as HTMLElement;
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('backdrop-blur-xl');
    // Inline style is the contract that wires into iOS safe-area.
    expect(header.getAttribute('style')).toContain('safe-area-inset-top');
  });

  it('opens the search modal when the search button is clicked', () => {
    const searchButton = fixture.debugElement.query(
      By.css('button[aria-label="Search"]'),
    );
    searchButton.nativeElement.click();
    expect(searchService.open).toHaveBeenCalled();
  });

  it('shows the cart badge only when count > 0', () => {
    expect(fixture.debugElement.queryAll(By.css('span.bg-primary')).length).toBe(0);

    count$.next(2);
    fixture.detectChanges();

    const badges = fixture.debugElement.queryAll(By.css('span.bg-primary'));
    expect(badges.length).toBe(1);
    expect(badges[0].nativeElement.textContent.trim()).toBe('2');
  });
});
