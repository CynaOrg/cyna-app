import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('exposes a non-empty legalLinks list', () => {
    expect(component.legalLinks.length).toBeGreaterThan(0);
    expect(component.legalLinks.every((l) => l.labelKey && l.route)).toBeTrue();
  });

  it('renders one anchor per social link', () => {
    const socials = fixture.debugElement.queryAll(By.css('a[target="_blank"]'));
    expect(socials.length).toBe(component.socialLinks.length);
  });

  it('renders the cyna logo', () => {
    const logo = fixture.debugElement.query(By.css('app-cyna-logo'));
    expect(logo).toBeTruthy();
  });
});
