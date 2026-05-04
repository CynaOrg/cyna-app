import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HapticService } from '@core/native';
import { PullToRefreshComponent } from './pull-to-refresh.component';

describe('PullToRefreshComponent', () => {
  let fixture: ComponentFixture<PullToRefreshComponent>;
  let component: PullToRefreshComponent;
  let mockHaptics: jasmine.SpyObj<HapticService>;

  beforeEach(async () => {
    mockHaptics = jasmine.createSpyObj<HapticService>('HapticService', [
      'light',
      'medium',
      'heavy',
      'selection',
    ]);
    mockHaptics.light.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [PullToRefreshComponent],
      providers: [{ provide: HapticService, useValue: mockHaptics }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PullToRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders an ion-refresher with chevron pulling icon', () => {
    const refresher = fixture.nativeElement.querySelector('ion-refresher');
    const content = fixture.nativeElement.querySelector(
      'ion-refresher-content',
    );
    expect(refresher).toBeTruthy();
    expect(content?.getAttribute('pullingicon')).toBe(
      'chevron-down-circle-outline',
    );
    expect(content?.getAttribute('refreshingspinner')).toBe('circles');
  });

  it('emits the `refresh` output and fires a light haptic on ionRefresh', () => {
    const refreshSpy = jasmine.createSpy('refresh');
    component.refresh.subscribe(refreshSpy);

    // Simulate the ion-refresher firing its event by invoking the
    // protected handler directly — covers the wiring without needing a
    // real Ionic stencil component.
    (component as unknown as { onRefresh: (e: Event) => void }).onRefresh(
      new Event('ionRefresh'),
    );

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(mockHaptics.light).toHaveBeenCalledTimes(1);
  });

  it('complete() resolves even when the refresher element has no `complete` method', async () => {
    // The fake DOM element rendered in tests is not a real Ionic web
    // component, so calling `complete()` will throw — we want this to
    // be swallowed.
    await expectAsync(component.complete()).toBeResolved();
  });

  it('complete() invokes the underlying ion-refresher complete()', async () => {
    const completeSpy = jasmine
      .createSpy('complete')
      .and.resolveTo();
    // Patch the ViewChild's nativeElement with a stub exposing `complete`.
    // `defineProperty` is required because the HTMLElement does not
    // expose `complete` natively and the property is read-only.
    const ref = (
      component as unknown as {
        refresherRef: { nativeElement: HTMLElement };
      }
    ).refresherRef;
    Object.defineProperty(ref.nativeElement, 'complete', {
      configurable: true,
      writable: true,
      value: completeSpy,
    });

    await component.complete();
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });
});
