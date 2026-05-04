import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CatalogHubPage } from './catalog-hub.page';
import { ProductStore } from '@core/stores/product.store';

describe('CatalogHubPage', () => {
  let component: CatalogHubPage;
  let fixture: ComponentFixture<CatalogHubPage>;
  let productStoreSpy: jasmine.SpyObj<ProductStore>;

  beforeEach(async () => {
    productStoreSpy = jasmine.createSpyObj<ProductStore>(
      'ProductStore',
      ['fetchProducts'],
      {
        isLoading$: of(false),
        error$: of(null),
        featured$: of([]),
      },
    );
    productStoreSpy.fetchProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [CatalogHubPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideHttpClient(),
        { provide: ProductStore, useValue: productStoreSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogHubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the three catalog cards (services, products, licenses)', () => {
    const routes = component.cards.map((c) => c.route);
    expect(routes).toEqual(['/services', '/products', '/licenses']);
  });

  it('triggers a product fetch on init', () => {
    expect(productStoreSpy.fetchProducts).toHaveBeenCalledWith({ limit: 20 });
  });

  it('renders one anchor per catalog entry', () => {
    const anchors: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a'),
    );
    // 3 catalog cards -> at minimum 3 anchors. The mobile-header may add
    // some too (cart icon link), so we check >= 3 instead of strict equality.
    expect(anchors.length).toBeGreaterThanOrEqual(3);
  });

  describe('onRefresh', () => {
    it('re-fetches products and completes the refresher', async () => {
      const refresher = jasmine.createSpyObj('PullToRefreshComponent', [
        'complete',
      ]);
      refresher.complete.and.resolveTo();

      productStoreSpy.fetchProducts.calls.reset();
      productStoreSpy.fetchProducts.and.returnValue(of([]));

      await component.onRefresh(refresher);
      expect(productStoreSpy.fetchProducts).toHaveBeenCalledWith({ limit: 20 });
      expect(refresher.complete).toHaveBeenCalledTimes(1);
    });
  });
});
