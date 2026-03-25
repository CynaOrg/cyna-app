import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label text', () => {
    fixture.componentRef.setInput('label', 'Click Me');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.textContent).toContain('Click Me');
  });

  it('should emit clicked event on click', () => {
    const spy = spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const spy = spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply primary variant class by default', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('bg-primary');
  });

  it('should apply outline variant class', () => {
    fixture.componentRef.setInput('variant', 'outline');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('bg-surface');
  });

  it('should set button type attribute', () => {
    expect(
      fixture.debugElement.query(By.css('button')).nativeElement.type,
    ).toBe('button');

    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('button')).nativeElement.type,
    ).toBe('submit');
  });
});
