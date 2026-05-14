import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MobileStateComponent } from './mobile-state.component';

describe('MobileStateComponent', () => {
  let fixture: ComponentFixture<MobileStateComponent>;
  let component: MobileStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MobileStateComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MobileStateComponent);
    component = fixture.componentInstance;
  });

  it('creates with loading variant', () => {
    fixture.componentRef.setInput('variant', 'loading');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const spinner = fixture.debugElement.query(By.css('ion-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('renders the title in the loading variant', () => {
    fixture.componentRef.setInput('variant', 'loading');
    fixture.componentRef.setInput('title', 'STATE.LOADING');
    fixture.detectChanges();
    const p = fixture.debugElement.query(By.css('p'));
    expect(p.nativeElement.textContent).toContain('STATE.LOADING');
  });

  it('renders title + description for empty state', () => {
    fixture.componentRef.setInput('variant', 'empty');
    fixture.componentRef.setInput('title', 'EMPTY.TITLE');
    fixture.componentRef.setInput('description', 'EMPTY.DESC');
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('h2')).nativeElement.textContent,
    ).toContain('EMPTY.TITLE');
    expect(
      fixture.debugElement.query(By.css('p')).nativeElement.textContent,
    ).toContain('EMPTY.DESC');
  });

  it('renders a routerLink CTA when ctaRoute is provided', () => {
    fixture.componentRef.setInput('variant', 'empty');
    fixture.componentRef.setInput('ctaLabel', 'CTA');
    fixture.componentRef.setInput('ctaRoute', '/products');
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
  });

  it('renders a button CTA and emits ctaClick when no ctaRoute', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.componentRef.setInput('ctaLabel', 'CTA');
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
    spyOn(component.ctaClick, 'emit');
    btn.nativeElement.click();
    expect(component.ctaClick.emit).toHaveBeenCalled();
  });
});
