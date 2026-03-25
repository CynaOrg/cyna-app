import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent.trim()).toBe('Email');
  });

  it('should display error message when error input is set', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('p'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent.trim()).toBe('Required field');
  });

  it('should implement ControlValueAccessor writeValue', () => {
    component.writeValue('hello');
    expect(component.value()).toBe('hello');
  });

  it('should implement ControlValueAccessor writeValue with null', () => {
    component.writeValue(null as unknown as string);
    expect(component.value()).toBe('');
  });

  it('should implement ControlValueAccessor registerOnChange', () => {
    const changeFn = jasmine.createSpy('onChange');
    component.registerOnChange(changeFn);

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'test';
    input.nativeElement.dispatchEvent(new Event('input'));

    expect(changeFn).toHaveBeenCalledWith('test');
  });

  it('should update value on input event', () => {
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'new value';
    input.nativeElement.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('new value');
  });

  it('should mark as disabled via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBeTrue();

    component.setDisabledState(false);
    fixture.detectChanges();

    expect(input.nativeElement.disabled).toBeFalse();
  });
});
