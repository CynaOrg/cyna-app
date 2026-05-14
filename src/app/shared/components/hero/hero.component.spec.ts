import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let component: HeroComponent;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('fr');
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders both CTAs', () => {
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('a[routerLink]'));
    expect(links.length).toBe(2);
  });

  it('apiSubtitle returns null when no heroText is supplied', () => {
    fixture.detectChanges();
    expect(component.apiSubtitle()).toBeNull();
  });

  it('apiSubtitle returns French value when current lang is fr', () => {
    component.heroText = {
      titleFr: 'Bonjour',
      titleEn: 'Hello',
      subtitleFr: 'Sous-titre',
      subtitleEn: 'Subtitle',
    };
    fixture.detectChanges();
    expect(component.apiSubtitle()).toBe('Sous-titre');
  });

  it('apiSubtitle returns English value when current lang is en', () => {
    translate.use('en');
    component.heroText = {
      titleFr: 'Bonjour',
      titleEn: 'Hello',
      subtitleFr: 'Sous-titre',
      subtitleEn: 'Subtitle',
    };
    fixture.detectChanges();
    expect(component.apiSubtitle()).toBe('Subtitle');
  });

  it('apiSubtitle returns null when value is empty/whitespace', () => {
    component.heroText = {
      titleFr: '   ',
      titleEn: '',
      subtitleFr: '',
      subtitleEn: '   ',
    };
    fixture.detectChanges();
    expect(component.apiSubtitle()).toBeNull();
  });

  it('reacts to language changes for subtitle', () => {
    fixture.detectChanges();
    component.heroText = {
      titleFr: '',
      titleEn: '',
      subtitleFr: 'A',
      subtitleEn: 'B',
    };
    translate.use('en');
    fixture.detectChanges();
    expect(component.apiSubtitle()).toBe('B');
  });
});
