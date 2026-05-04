import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircle,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OrderConfirmationPage } from './order-confirmation.page';
import { OrderApiService } from '@core/services/order-api.service';
import { AuthStore } from '@core/stores/auth.store';
import { HapticService } from '@core/native';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { HapticOnDirective } from '@shared/directives';

describe('OrderConfirmationPage', () => {
  let fixture: ComponentFixture<OrderConfirmationPage>;
  let component: OrderConfirmationPage;

  const mockOrderApi = jasmine.createSpyObj('OrderApiService', ['getOrderById']);
  const mockAuthStore = {
    isAuthenticated$: new BehaviorSubject(false),
  };
  const mockHaptic = jasmine.createSpyObj('HapticService', ['selection']);

  function setup(routeId: string | null, navState: unknown = null) {
    return TestBed.configureTestingModule({
      declarations: [OrderConfirmationPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        NgIconComponent,
        BrowserHeaderComponent,
        MobileHeaderComponent,
        DashboardTopBarComponent,
        SkeletonListComponent,
        HapticOnDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: HapticService, useValue: mockHaptic },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => routeId } },
          },
        },
        provideIcons({ phosphorCheckCircle, phosphorWarningCircle }),
      ],
    })
      .compileComponents()
      .then(() => {
        if (navState) {
          history.replaceState(navState, '');
        } else {
          history.replaceState({}, '');
        }
        fixture = TestBed.createComponent(OrderConfirmationPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }

  beforeEach(() => {
    mockHaptic.selection.calls.reset();
    mockHaptic.selection.and.returnValue(Promise.resolve());
    mockOrderApi.getOrderById.calls.reset();
  });

  it('should create from navigation state and fire selection haptic', async () => {
    await setup('order-1', {
      orderNumber: 'ORD-123',
      total: 199,
      items: [],
    });
    expect(component.order()?.orderNumber).toBe('ORD-123');
    expect(component.isLoading()).toBeFalse();
    expect(mockHaptic.selection).toHaveBeenCalled();
  });

  it('should fall back to API when no navigation state, fire haptic on success', async () => {
    mockOrderApi.getOrderById.and.returnValue(
      of({
        id: 'order-2',
        orderNumber: 'ORD-456',
        items: [],
        subtotal: 0,
        total: 100,
        status: 'paid',
      } as unknown),
    );

    await setup('order-2');

    expect(mockOrderApi.getOrderById).toHaveBeenCalledWith('order-2');
    expect(component.order()?.orderNumber).toBe('ORD-456');
    expect(component.isLoading()).toBeFalse();
    expect(mockHaptic.selection).toHaveBeenCalled();
  });

  it('should not fire haptic on API error', async () => {
    mockOrderApi.getOrderById.and.returnValue(throwError(() => new Error('boom')));

    await setup('order-3');

    expect(component.order()).toBeNull();
    expect(component.isLoading()).toBeFalse();
    expect(mockHaptic.selection).not.toHaveBeenCalled();
  });
});
