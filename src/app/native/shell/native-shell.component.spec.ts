import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NativeShellComponent } from './native-shell.component';

describe('NativeShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeShellComponent],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the native shell', () => {
    const fixture = TestBed.createComponent(NativeShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router outlet', () => {
    const fixture = TestBed.createComponent(NativeShellComponent);
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('ion-router-outlet');
    expect(outlet).toBeTruthy();
  });
});
