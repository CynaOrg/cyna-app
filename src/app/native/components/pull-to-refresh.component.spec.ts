import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PullToRefreshComponent } from './pull-to-refresh.component';
import { HapticService } from '../services/haptic.service';

describe('PullToRefreshComponent', () => {
  let haptics: jasmine.SpyObj<HapticService>;

  beforeEach(async () => {
    haptics = jasmine.createSpyObj<HapticService>('HapticService', [
      'light',
      'medium',
      'heavy',
      'selection',
    ]);
    haptics.light.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [PullToRefreshComponent],
      providers: [{ provide: HapticService, useValue: haptics }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(PullToRefreshComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits the (refresh) output and triggers a light haptic on pull', () => {
    const fixture = TestBed.createComponent(PullToRefreshComponent);
    const cmp = fixture.componentInstance;
    let emitted = 0;
    cmp.refresh.subscribe(() => emitted++);

    cmp.onRefresh();

    expect(emitted).toBe(1);
    expect(haptics.light).toHaveBeenCalledTimes(1);
  });

  it('complete() resolves even when no refresher has been queried yet', async () => {
    const fixture = TestBed.createComponent(PullToRefreshComponent);
    const cmp = fixture.componentInstance;
    await expectAsync(cmp.complete()).toBeResolved();
  });

  it('complete() delegates to the underlying ion-refresher when present', async () => {
    const fixture = TestBed.createComponent(PullToRefreshComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    const fakeRefresher = { complete: jasmine.createSpy('complete').and.resolveTo() };
    // Force the ViewChild to point at our fake — the real ion-refresher is
    // a stubbed custom element in the unit test environment.
    (cmp as unknown as { refresher: typeof fakeRefresher }).refresher =
      fakeRefresher;
    await cmp.complete();
    expect(fakeRefresher.complete).toHaveBeenCalledTimes(1);
  });
});
