import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { MentionsNativePage } from './mentions-native.page';

describe('MentionsNativePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        MentionsNativePage,
      ],
      providers: [
        provideRouter([]),
        { provide: Location, useValue: { back: () => undefined } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the page', () => {
    const fixture = TestBed.createComponent(MentionsNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders editor + host + extra sections', () => {
    const fixture = TestBed.createComponent(MentionsNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    const sections = fixture.nativeElement.querySelectorAll('section');
    // editor + host + sections.length sections.
    expect(sections.length).toBe(2 + page.sections.length);
  });

  it('lists every editor and host field key', () => {
    const fixture = TestBed.createComponent(MentionsNativePage);
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent || '';
    const page = fixture.componentInstance;
    for (const k of [...page.editorFields, ...page.hostFields]) {
      expect(text).toContain(k);
    }
  });
});
