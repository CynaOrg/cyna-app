import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MobileListSkeletonComponent } from './mobile-list-skeleton.component';

describe('MobileListSkeletonComponent', () => {
  let fixture: ComponentFixture<MobileListSkeletonComponent>;
  let component: MobileListSkeletonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileListSkeletonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MobileListSkeletonComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders count rows by default (3)', () => {
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(rows.length).toBe(3);
  });

  it('renders the requested number of rows', () => {
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(rows.length).toBe(5);
  });

  it('renders the address variant', () => {
    fixture.componentRef.setInput('variant', 'address');
    fixture.componentRef.setInput('count', 2);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(rows.length).toBe(2);
  });

  it('renders the form variant', () => {
    fixture.componentRef.setInput('variant', 'form');
    fixture.componentRef.setInput('count', 1);
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(rows.length).toBe(1);
  });
});
