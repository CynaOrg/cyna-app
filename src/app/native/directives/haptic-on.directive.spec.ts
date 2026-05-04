import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HapticOnDirective, HapticLevel } from './haptic-on.directive';
import { HapticService } from '../services/haptic.service';

@Component({
  standalone: true,
  imports: [HapticOnDirective],
  template: `<button [appHapticOn]="level">Tap</button>`,
})
class HostComponent {
  level: HapticLevel = 'light';
}

describe('HapticOnDirective', () => {
  let haptics: jasmine.SpyObj<HapticService>;

  beforeEach(async () => {
    haptics = jasmine.createSpyObj<HapticService>('HapticService', [
      'light',
      'medium',
      'heavy',
      'selection',
    ]);
    haptics.light.and.resolveTo();
    haptics.medium.and.resolveTo();
    haptics.heavy.and.resolveTo();
    haptics.selection.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: HapticService, useValue: haptics }],
    }).compileComponents();
  });

  function clickWith(level: HapticLevel): void {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.level = level;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.debugElement.query(
      By.directive(HapticOnDirective),
    ).nativeElement;
    button.click();
  }

  it('triggers a light haptic by default', () => {
    clickWith('light');
    expect(haptics.light).toHaveBeenCalledTimes(1);
  });

  it('routes "medium" to HapticService.medium', () => {
    clickWith('medium');
    expect(haptics.medium).toHaveBeenCalledTimes(1);
  });

  it('routes "heavy" to HapticService.heavy', () => {
    clickWith('heavy');
    expect(haptics.heavy).toHaveBeenCalledTimes(1);
  });

  it('routes "selection" to HapticService.selection', () => {
    clickWith('selection');
    expect(haptics.selection).toHaveBeenCalledTimes(1);
  });
});
