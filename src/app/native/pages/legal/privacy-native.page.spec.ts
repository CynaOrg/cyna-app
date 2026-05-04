import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { PrivacyNativePage } from './privacy-native.page';

describe('PrivacyNativePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        PrivacyNativePage,
      ],
      providers: [
        provideRouter([]),
        { provide: Location, useValue: { back: () => undefined } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the page', () => {
    const fixture = TestBed.createComponent(PrivacyNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one section per entry plus a DPO block', () => {
    const fixture = TestBed.createComponent(PrivacyNativePage);
    fixture.detectChanges();
    const sections = fixture.nativeElement.querySelectorAll('section');
    expect(sections.length).toBe(
      fixture.componentInstance.sections.length + 1,
    );
  });
});
