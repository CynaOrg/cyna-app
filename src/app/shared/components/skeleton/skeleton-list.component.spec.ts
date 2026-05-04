import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonListComponent } from './skeleton-list.component';

describe('SkeletonListComponent', () => {
  let fixture: ComponentFixture<SkeletonListComponent>;
  let component: SkeletonListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonListComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the default product-card variant grid', () => {
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('.grid');
    expect(grid)
      .withContext('product-card variant should render a CSS grid')
      .toBeTruthy();
  });

  it('renders `count` skeleton cards in product-card variant', () => {
    fixture.componentRef.setInput('count', 5);
    fixture.componentRef.setInput('variant', 'product-card');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      '.grid > div',
    ) as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(5);
  });

  it('renders `count` rows in list-item variant', () => {
    fixture.componentRef.setInput('count', 4);
    fixture.componentRef.setInput('variant', 'list-item');
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[role="status"] > div',
    ) as NodeListOf<HTMLElement>;
    expect(rows.length).toBe(4);
  });

  it('renders the detail variant with hero + title + paragraph blocks', () => {
    fixture.componentRef.setInput('count', 2);
    fixture.componentRef.setInput('variant', 'detail');
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll(
      'ion-skeleton-text',
    ) as NodeListOf<HTMLElement>;
    // Hero (1) + title block (2) + 2 paragraphs of 3 lines each = 9
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });

  it('clamps negative count to zero', () => {
    fixture.componentRef.setInput('count', -3);
    fixture.componentRef.setInput('variant', 'product-card');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      '.grid > div',
    ) as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(0);
  });

  it('marks the container with aria-busy for screen readers', () => {
    fixture.detectChanges();
    const region = fixture.nativeElement.querySelector('[role="status"]');
    expect(region?.getAttribute('aria-busy')).toBe('true');
  });
});
