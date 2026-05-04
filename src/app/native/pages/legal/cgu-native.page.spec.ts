import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { CguNativePage } from './cgu-native.page';

describe('CguNativePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        CguNativePage,
      ],
      providers: [
        provideRouter([]),
        { provide: Location, useValue: { back: () => undefined } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the page', () => {
    const fixture = TestBed.createComponent(CguNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one section per declared entry', () => {
    const fixture = TestBed.createComponent(CguNativePage);
    fixture.detectChanges();
    const sections = fixture.nativeElement.querySelectorAll('section');
    expect(sections.length).toBe(fixture.componentInstance.sections.length);
  });

  it('uses i18n keys (no hard-coded text leaked into rendered article)', () => {
    const fixture = TestBed.createComponent(CguNativePage);
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent || '';
    // Each declared key should appear at least once because the fake
    // translate pipe echoes the key when no resource is registered.
    for (const section of fixture.componentInstance.sections) {
      expect(text).toContain(section.titleKey);
    }
  });
});
