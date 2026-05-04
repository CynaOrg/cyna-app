import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';

import { HomePage } from './home.page';
import { ProductStore } from '@core/stores/product.store';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let productStoreSpy: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    saasProducts$: BehaviorSubject<unknown[]>;
    products$: BehaviorSubject<unknown[]>;
  };

  beforeEach(async () => {
    const isLoading$ = new BehaviorSubject<boolean>(false);
    const error$ = new BehaviorSubject<string | null>(null);
    const saasProducts$ = new BehaviorSubject<unknown[]>([]);
    const products$ = new BehaviorSubject<unknown[]>([]);

    const spy = jasmine.createSpyObj<ProductStore>('ProductStore', [
      'fetchProducts',
    ]);
    spy.fetchProducts.and.returnValue(of([]));

    productStoreSpy = Object.assign(spy, {
      isLoading$,
      error$,
      saasProducts$,
      products$,
    }) as typeof productStoreSpy;

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        { provide: ProductStore, useValue: productStoreSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('triggers an initial fetchProducts on init', () => {
    expect(productStoreSpy.fetchProducts).toHaveBeenCalledWith({ limit: 20 });
  });

  describe('onRefresh', () => {
    it('re-fetches products and completes the refresher', async () => {
      productStoreSpy.fetchProducts.calls.reset();
      productStoreSpy.fetchProducts.and.returnValue(of([]));

      const refresher = jasmine.createSpyObj<PullToRefreshComponent>(
        'PullToRefreshComponent',
        ['complete'],
      );
      refresher.complete.and.resolveTo();

      await component.onRefresh(refresher);

      expect(productStoreSpy.fetchProducts).toHaveBeenCalledWith({ limit: 20 });
      expect(refresher.complete).toHaveBeenCalledTimes(1);
    });

    it('still completes the refresher when fetch errors out', async () => {
      productStoreSpy.fetchProducts.and.returnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({
          subscribe: ({ error }: { error: (e: unknown) => void }) => {
            error(new Error('boom'));
            return { unsubscribe: () => undefined };
          },
        } as any),
      );
      const refresher = jasmine.createSpyObj<PullToRefreshComponent>(
        'PullToRefreshComponent',
        ['complete'],
      );
      refresher.complete.and.resolveTo();

      try {
        await component.onRefresh(refresher);
      } catch {
        // The store-level fetchProducts is expected to surface errors —
        // we just need to assert the refresher always completes.
      }
      expect(refresher.complete).toHaveBeenCalledTimes(1);
    });
  });
});
