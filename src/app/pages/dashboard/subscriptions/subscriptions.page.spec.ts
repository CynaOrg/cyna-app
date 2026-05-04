import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorShieldCheck } from '@ng-icons/phosphor-icons/regular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { DashboardSubscriptionsPage } from './subscriptions.page';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

describe('DashboardSubscriptionsPage (subscriptions.page)', () => {
  let component: DashboardSubscriptionsPage;
  let fixture: ComponentFixture<DashboardSubscriptionsPage>;

  const mockSubStore = {
    subscriptions$: new BehaviorSubject<unknown[]>([]),
    isLoading$: new BehaviorSubject(false),
    error$: new BehaviorSubject<string | null>(null),
    loadSubscriptions: jasmine.createSpy('loadSubscriptions'),
    cancelSubscription: jasmine.createSpy('cancelSubscription'),
  };

  beforeEach(async () => {
    mockSubStore.loadSubscriptions.calls.reset();
    mockSubStore.cancelSubscription.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [DashboardSubscriptionsPage],
      imports: [
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        NgIconComponent,
        SkeletonListComponent,
        PullToRefreshComponent,
        HapticOnDirective,
      ],
      providers: [
        { provide: SubscriptionStore, useValue: mockSubStore },
        provideIcons({ phosphorShieldCheck }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSubscriptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load subscriptions on init', () => {
    expect(component).toBeTruthy();
    expect(mockSubStore.loadSubscriptions).toHaveBeenCalled();
  });

  it('reloads subscriptions and dismisses refresher on pull-to-refresh', async () => {
    mockSubStore.loadSubscriptions.calls.reset();
    const completeSpy = jasmine
      .createSpy('complete')
      .and.returnValue(Promise.resolve());
    const refresher = {
      complete: completeSpy,
    } as unknown as PullToRefreshComponent;

    await component.onRefresh(refresher);

    expect(mockSubStore.loadSubscriptions).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('filters subscriptions by status', () => {
    mockSubStore.subscriptions$.next([
      { id: 'a', status: 'active' },
      { id: 'b', status: 'cancelled' },
      { id: 'c', status: 'active' },
    ]);
    component.setStatusFilter('active');
    expect(component.filteredSubscriptions.length).toBe(2);
    expect(component.getStatusCount('active')).toBe(2);
    expect(component.getStatusCount('')).toBe(3);
  });

  it('handles cancel confirmation flow', () => {
    component.confirmCancel('sub-1');
    expect(component.confirmingCancelId).toBe('sub-1');

    component.cancelCancel();
    expect(component.confirmingCancelId).toBeNull();

    component.confirmCancel('sub-2');
    component.doCancel('sub-2');
    expect(mockSubStore.cancelSubscription).toHaveBeenCalledWith('sub-2');
    expect(component.confirmingCancelId).toBeNull();
  });

  it('returns stable color and gradient hashes', () => {
    expect(component.getStatusColor('active')).toBeTruthy();
    expect(component.getItemGradient('alpha')).toBe(
      component.getItemGradient('alpha'),
    );
    expect(component.getProductInitials('Cyna SOC')).toBe('CS');
  });
});
