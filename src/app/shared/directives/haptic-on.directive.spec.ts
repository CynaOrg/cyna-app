import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HapticService } from '@core/native';
import { HapticOnDirective } from './haptic-on.directive';

@Component({
  standalone: true,
  imports: [HapticOnDirective],
  template: `
    <button id="default" appHapticOn>default</button>
    <button id="light" appHapticOn="light">light</button>
    <button id="medium" appHapticOn="medium">medium</button>
    <button id="heavy" appHapticOn="heavy">heavy</button>
    <button id="selection" appHapticOn="selection">selection</button>
  `,
})
class HostComponent {}

describe('HapticOnDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let mockHaptics: jasmine.SpyObj<HapticService>;

  beforeEach(async () => {
    mockHaptics = jasmine.createSpyObj<HapticService>('HapticService', [
      'light',
      'medium',
      'heavy',
      'selection',
    ]);
    mockHaptics.light.and.resolveTo();
    mockHaptics.medium.and.resolveTo();
    mockHaptics.heavy.and.resolveTo();
    mockHaptics.selection.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: HapticService, useValue: mockHaptics }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function clickById(id: string): void {
    const btn = fixture.debugElement.query(
      By.css(`#${id}`),
    ) as DebugElement;
    btn.nativeElement.click();
  }

  it('defaults to light when no value is provided', () => {
    clickById('default');
    expect(mockHaptics.light).toHaveBeenCalledTimes(1);
    expect(mockHaptics.medium).not.toHaveBeenCalled();
    expect(mockHaptics.heavy).not.toHaveBeenCalled();
    expect(mockHaptics.selection).not.toHaveBeenCalled();
  });

  it('triggers light() when appHapticOn="light"', () => {
    clickById('light');
    expect(mockHaptics.light).toHaveBeenCalledTimes(1);
  });

  it('triggers medium() when appHapticOn="medium"', () => {
    clickById('medium');
    expect(mockHaptics.medium).toHaveBeenCalledTimes(1);
  });

  it('triggers heavy() when appHapticOn="heavy"', () => {
    clickById('heavy');
    expect(mockHaptics.heavy).toHaveBeenCalledTimes(1);
  });

  it('triggers selection() when appHapticOn="selection"', () => {
    clickById('selection');
    expect(mockHaptics.selection).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the haptic service rejects', () => {
    mockHaptics.medium.and.rejectWith(new Error('plugin missing'));
    expect(() => clickById('medium')).not.toThrow();
  });
});
