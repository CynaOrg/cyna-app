import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayRowComponent } from './display-row.component';

describe('DisplayRowComponent', () => {
  let fixture: ComponentFixture<DisplayRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayRowComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(DisplayRowComponent);
  });

  it('renders the label and value when both are provided', () => {
    fixture.componentRef.setInput('label', 'Prénom');
    fixture.componentRef.setInput('value', 'Alice');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Prénom');
    expect(el.textContent).toContain('Alice');
  });

  it('renders the "not provided" placeholder when value is empty', () => {
    fixture.componentRef.setInput('label', 'TVA');
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('TVA');
    expect(el.textContent).toContain('COMMON.NOT_PROVIDED');
  });

  it('renders the "not provided" placeholder when value is null', () => {
    fixture.componentRef.setInput('label', 'TVA');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('COMMON.NOT_PROVIDED');
  });
});
