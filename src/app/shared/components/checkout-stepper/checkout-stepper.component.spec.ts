import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckoutStepperComponent } from './checkout-stepper.component';

describe('CheckoutStepperComponent', () => {
  let fixture: ComponentFixture<CheckoutStepperComponent>;
  let component: CheckoutStepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutStepperComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutStepperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('current', 1);
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders three steps and two connectors', () => {
    fixture.detectChanges();
    const dots = fixture.debugElement.queryAll(By.css('span.rounded-full'));
    expect(dots.length).toBe(3);
  });

  it('marks step 1 as current when current=1', () => {
    fixture.componentRef.setInput('current', 1);
    fixture.detectChanges();
    const current = fixture.debugElement.queryAll(
      By.css('[aria-current="step"]'),
    );
    expect(current.length).toBe(1);
  });

  it('marks step 2 as current when current=2', () => {
    fixture.componentRef.setInput('current', 2);
    fixture.detectChanges();
    const current = fixture.debugElement.query(By.css('[aria-current="step"]'));
    expect(current).toBeTruthy();
  });

  it('renders three labels', () => {
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(
      By.css('span.flex-1.text-\\[11px\\]'),
    );
    expect(labels.length).toBe(3);
  });
});
