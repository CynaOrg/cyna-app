import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('Accept terms');
  });

  it('should toggle checked state on click', () => {
    expect(component.checked()).toBeFalse();

    const label = fixture.debugElement.query(By.css('label'));
    label.nativeElement.click();
    fixture.detectChanges();

    expect(component.checked()).toBeTrue();

    label.nativeElement.click();
    fixture.detectChanges();

    expect(component.checked()).toBeFalse();
  });

  it('should implement ControlValueAccessor writeValue', () => {
    component.writeValue(true);
    expect(component.checked()).toBeTrue();

    component.writeValue(false);
    expect(component.checked()).toBeFalse();
  });

  it('should implement ControlValueAccessor registerOnChange and registerOnTouched', () => {
    const changeFn = jasmine.createSpy('onChange');
    const touchedFn = jasmine.createSpy('onTouched');
    component.registerOnChange(changeFn);
    component.registerOnTouched(touchedFn);

    component.toggle();

    expect(changeFn).toHaveBeenCalledWith(true);
    expect(touchedFn).toHaveBeenCalled();
  });

  it('should emit change via onChange callback', () => {
    const changeFn = jasmine.createSpy('onChange');
    component.registerOnChange(changeFn);

    component.toggle();
    expect(changeFn).toHaveBeenCalledWith(true);

    component.toggle();
    expect(changeFn).toHaveBeenCalledWith(false);
  });
});
