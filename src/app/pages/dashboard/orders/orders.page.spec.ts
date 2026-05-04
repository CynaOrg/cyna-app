import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorPackage } from '@ng-icons/phosphor-icons/regular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { DashboardOrdersPage } from './orders.page';
import { OrderStore } from '@core/stores/order.store';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

describe('DashboardOrdersPage (orders.page)', () => {
  let component: DashboardOrdersPage;
  let fixture: ComponentFixture<DashboardOrdersPage>;

  const mockOrderStore = {
    orders$: new BehaviorSubject<unknown[]>([]),
    isLoading$: new BehaviorSubject(false),
    error$: new BehaviorSubject<string | null>(null),
    loadOrders: jasmine.createSpy('loadOrders'),
  };

  beforeEach(async () => {
    mockOrderStore.loadOrders.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [DashboardOrdersPage],
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
        { provide: OrderStore, useValue: mockOrderStore },
        provideIcons({ phosphorPackage }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load orders on init', () => {
    expect(component).toBeTruthy();
    expect(mockOrderStore.loadOrders).toHaveBeenCalled();
  });

  it('reloads orders and dismisses refresher on pull-to-refresh', async () => {
    mockOrderStore.loadOrders.calls.reset();
    const completeSpy = jasmine
      .createSpy('complete')
      .and.returnValue(Promise.resolve());
    const refresher = {
      complete: completeSpy,
    } as unknown as PullToRefreshComponent;

    await component.onRefresh(refresher);

    expect(mockOrderStore.loadOrders).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('filters orders by status', () => {
    mockOrderStore.orders$.next([
      { id: '1', status: 'paid' },
      { id: '2', status: 'pending' },
    ]);
    component.setStatusFilter('paid');
    expect(component.filteredOrders.length).toBe(1);
    expect(component.getStatusCount('paid')).toBe(1);
    expect(component.getStatusCount('')).toBe(2);
  });

  it('produces stable gradients per name', () => {
    const a = component.getItemGradient('Alpha Service');
    const b = component.getItemGradient('Alpha Service');
    expect(a).toBe(b);
  });

  it('returns initials from product name', () => {
    expect(component.getProductInitials('Cyna SOC')).toBe('CS');
    expect(component.getProductInitials('OnlyOne')).toBe('ON');
    expect(component.getProductInitials('')).toBe('?');
  });
});
