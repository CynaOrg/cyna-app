import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  function setupPagination(currentPage: number, totalPages: number): void {
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
  }

  it('should create', () => {
    setupPagination(1, 5);
    expect(component).toBeTruthy();
  });

  it('should emit pageChange on page click', () => {
    setupPagination(1, 5);
    const spy = spyOn(component.pageChange, 'emit');

    // Click on page 2 button
    const pageButtons = fixture.debugElement
      .queryAll(By.css('button'))
      .filter((btn) => btn.nativeElement.textContent.trim() === '2');
    expect(pageButtons.length).toBeGreaterThan(0);
    pageButtons[0].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    setupPagination(1, 5);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const prevButton = buttons[0];
    expect(prevButton.nativeElement.disabled).toBeTrue();
  });

  it('should disable next button on last page', () => {
    setupPagination(5, 5);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton.nativeElement.disabled).toBeTrue();
  });

  it('should calculate visible pages correctly for 5 or fewer pages', () => {
    setupPagination(1, 4);
    expect(component.visiblePages()).toEqual([1, 2, 3, 4]);
  });

  it('should calculate visible pages with ellipsis for many pages', () => {
    setupPagination(5, 10);
    const pages = component.visiblePages();

    // Should start with 1, have ellipsis (-1), middle pages, ellipsis (-1), end with 10
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
    expect(pages).toContain(-1); // ellipsis
    expect(pages).toContain(5); // current page
  });

  it('should not render when totalPages is 1', () => {
    setupPagination(1, 1);
    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeNull();
  });
});
