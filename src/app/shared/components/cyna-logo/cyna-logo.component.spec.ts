import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CynaLogoComponent } from './cyna-logo.component';

describe('CynaLogoComponent', () => {
  let fixture: ComponentFixture<CynaLogoComponent>;
  let component: CynaLogoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CynaLogoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CynaLogoComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the full variant by default', () => {
    fixture.detectChanges();
    const svgs = fixture.debugElement.queryAll(By.css('svg'));
    expect(svgs.length).toBe(1);
    expect(svgs[0].nativeElement.getAttribute('viewBox')).toBe('0 0 355 94');
  });

  it('renders the mark variant when variant=mark', () => {
    fixture.componentRef.setInput('variant', 'mark');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg.nativeElement.getAttribute('viewBox')).toBe('0 0 54 54');
  });

  it('applies a custom color', () => {
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();
    const path = fixture.debugElement.query(By.css('path'));
    expect(path.nativeElement.getAttribute('fill')).toBe('#ff0000');
  });

  it('computes fullWidth from height', () => {
    fixture.componentRef.setInput('height', '94');
    fixture.detectChanges();
    expect(component.fullWidth()).toBe('355');
  });

  it('keeps height as a square box for the mark variant', () => {
    fixture.componentRef.setInput('variant', 'mark');
    fixture.componentRef.setInput('height', '48');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg.nativeElement.getAttribute('height')).toBe('48');
    expect(svg.nativeElement.getAttribute('width')).toBe('48');
  });
});
