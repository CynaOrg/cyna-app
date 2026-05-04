import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CartPage } from './cart.page';
import { CartStore } from '@core/stores/cart.store';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;

  const mockCartStore = {
    items$: new BehaviorSubject<unknown[]>([]),
    count$: new BehaviorSubject(0),
    total$: new BehaviorSubject(0),
    isEmpty$: new BehaviorSubject(true),
    isLoading$: new BehaviorSubject(false),
    error$: new BehaviorSubject<string | null>(null),
    cart$: new BehaviorSubject(null),
    loadCart: jasmine.createSpy('loadCart'),
    updateQuantity: jasmine.createSpy('updateQuantity'),
    removeItem: jasmine.createSpy('removeItem'),
    clear: jasmine.createSpy('clear'),
  };

  beforeEach(async () => {
    mockCartStore.loadCart.calls.reset();
    mockCartStore.removeItem.calls.reset();
    mockCartStore.clear.calls.reset();
    mockCartStore.updateQuantity.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [CartPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        NgIconComponent,
        BrowserHeaderComponent,
        MobileHeaderComponent,
        NavbarComponent,
        DashboardTopBarComponent,
        SkeletonListComponent,
        PullToRefreshComponent,
        HapticOnDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CartStore, useValue: mockCartStore },
        provideIcons({ phosphorArrowLeft }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose loading and empty state to the template', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.isEmpty()).toBeTrue();
  });

  describe('quantity controls', () => {
    it('increments quantity when below max stock', () => {
      component.increment('p1', 1, 5);
      expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('p1', 2);
    });

    it('does not increment past stock cap', () => {
      component.increment('p1', 5, 5);
      expect(mockCartStore.updateQuantity).not.toHaveBeenCalled();
    });

    it('decrements quantity above 1', () => {
      component.decrement('p1', 2);
      expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('p1', 1);
    });

    it('does not decrement below 1', () => {
      component.decrement('p1', 1);
      expect(mockCartStore.updateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('item actions', () => {
    it('removes item via store', () => {
      component.remove('p1');
      expect(mockCartStore.removeItem).toHaveBeenCalledWith('p1');
    });

    it('clears cart via store', () => {
      component.clearCart();
      expect(mockCartStore.clear).toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('reloads the cart and dismisses the refresher', async () => {
      const completeSpy = jasmine.createSpy('complete').and.returnValue(
        Promise.resolve(),
      );
      const refresher = { complete: completeSpy } as unknown as PullToRefreshComponent;

      await component.onRefresh(refresher);

      expect(mockCartStore.loadCart).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('still completes the refresher when the store throws', async () => {
      const completeSpy = jasmine.createSpy('complete').and.returnValue(
        Promise.resolve(),
      );
      mockCartStore.loadCart.and.throwError('boom');
      const refresher = { complete: completeSpy } as unknown as PullToRefreshComponent;

      try {
        await component.onRefresh(refresher);
      } catch {
        // expected
      }
      expect(completeSpy).toHaveBeenCalled();
      // restore default behavior for following tests
      mockCartStore.loadCart.and.stub();
    });
  });
});
