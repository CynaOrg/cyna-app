import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MobileListItemComponent } from './mobile-list-item.component';

describe('MobileListItemComponent', () => {
  let fixture: ComponentFixture<MobileListItemComponent>;
  let component: MobileListItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MobileListItemComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MobileListItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'My label');
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders as a button when no routerLink is supplied', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    const link = fixture.debugElement.query(By.css('a'));
    expect(btn).toBeTruthy();
    expect(link).toBeNull();
  });

  it('renders as a link when routerLink is supplied', () => {
    fixture.componentRef.setInput('routerLink', '/foo');
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
  });

  it('emits itemClick when the button is clicked', () => {
    fixture.detectChanges();
    spyOn(component.itemClick, 'emit');
    const btn = fixture.debugElement.query(By.css('button'));
    btn.nativeElement.click();
    expect(component.itemClick.emit).toHaveBeenCalled();
  });

  it('does not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    spyOn(component.itemClick, 'emit');
    component.onClick();
    expect(component.itemClick.emit).not.toHaveBeenCalled();
  });

  it('renders the separator unless last=true', () => {
    fixture.detectChanges();
    let sep = fixture.debugElement.query(By.css('.border-b'));
    expect(sep).toBeTruthy();
    fixture.componentRef.setInput('last', true);
    fixture.detectChanges();
    sep = fixture.debugElement.query(By.css('.border-b'));
    expect(sep).toBeNull();
  });

  it('renders the value text when provided', () => {
    fixture.componentRef.setInput('value', '42 €');
    fixture.detectChanges();
    const valueEl = fixture.debugElement.query(
      By.css('.text-sm.text-text-muted'),
    );
    expect(valueEl.nativeElement.textContent).toContain('42 €');
  });

  it('applies destructive class when destructive=true', () => {
    fixture.componentRef.setInput('destructive', true);
    fixture.detectChanges();
    const span = fixture.debugElement.query(By.css('span.text-red-600'));
    expect(span).toBeTruthy();
  });
});
