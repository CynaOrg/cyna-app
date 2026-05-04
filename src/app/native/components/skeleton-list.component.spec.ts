import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SkeletonListComponent } from './skeleton-list.component';

describe('SkeletonListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SkeletonListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the requested count of product-card placeholders', () => {
    const fixture = TestBed.createComponent(SkeletonListComponent);
    fixture.componentRef.setInput('variant', 'product-card');
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    const tiles = fixture.nativeElement.querySelectorAll(
      '.grid.grid-cols-2 > div',
    );
    expect(tiles.length).toBe(5);
  });

  it('renders list-item placeholders when variant is list-item', () => {
    const fixture = TestBed.createComponent(SkeletonListComponent);
    fixture.componentRef.setInput('variant', 'list-item');
    fixture.componentRef.setInput('count', 4);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul > li');
    expect(items.length).toBe(4);
  });

  it('renders the detail variant without item repetition', () => {
    const fixture = TestBed.createComponent(SkeletonListComponent);
    fixture.componentRef.setInput('variant', 'detail');
    fixture.componentRef.setInput('count', 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ul > li').length).toBe(0);
    expect(
      fixture.nativeElement.querySelectorAll('.grid.grid-cols-2 > div').length,
    ).toBe(0);
    // The detail block has a hero ion-skeleton-text plus several lines.
    const skeletons =
      fixture.nativeElement.querySelectorAll('ion-skeleton-text');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it('clamps a negative count to zero placeholders', () => {
    const fixture = TestBed.createComponent(SkeletonListComponent);
    fixture.componentRef.setInput('variant', 'product-card');
    fixture.componentRef.setInput('count', -3);
    fixture.detectChanges();
    const tiles = fixture.nativeElement.querySelectorAll(
      '.grid.grid-cols-2 > div',
    );
    expect(tiles.length).toBe(0);
  });
});
