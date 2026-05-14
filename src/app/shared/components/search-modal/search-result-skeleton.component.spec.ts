import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultSkeletonComponent } from './search-result-skeleton.component';

describe('SearchResultSkeletonComponent', () => {
  let fixture: ComponentFixture<SearchResultSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultSkeletonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchResultSkeletonComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the shimmer placeholders', () => {
    const placeholders = fixture.nativeElement.querySelectorAll('.shimmer');
    expect(placeholders.length).toBe(4);
  });
});
