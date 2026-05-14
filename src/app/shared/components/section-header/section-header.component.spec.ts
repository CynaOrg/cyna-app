import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  let fixture: ComponentFixture<SectionHeaderComponent>;
  let component: SectionHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SectionHeaderComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'My title');
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the title in the default (browser) variant', () => {
    fixture.detectChanges();
    const h2 = fixture.debugElement.query(By.css('h2'));
    expect(h2.nativeElement.textContent).toContain('My title');
  });

  it('renders a centered layout when centered=true', () => {
    fixture.componentRef.setInput('centered', true);
    fixture.detectChanges();
    const wrapper = fixture.debugElement.query(By.css('.flex.flex-col'));
    expect(wrapper).toBeTruthy();
  });

  it('shows the link when linkText and linkRoute are set (browser)', () => {
    fixture.componentRef.setInput('linkText', 'See all');
    fixture.componentRef.setInput('linkRoute', '/products');
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('See all');
  });

  it('does not render a link when only linkText is set', () => {
    fixture.componentRef.setInput('linkText', 'See all');
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeNull();
  });

  it('renders the mobile variant', () => {
    fixture.componentRef.setInput('variant', 'mobile');
    fixture.componentRef.setInput('linkText', 'See all');
    fixture.componentRef.setInput('linkRoute', '/products');
    fixture.detectChanges();
    const h2 = fixture.debugElement.query(By.css('h2'));
    expect(h2.nativeElement.style.fontSize).toBe('16px');
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
  });
});
