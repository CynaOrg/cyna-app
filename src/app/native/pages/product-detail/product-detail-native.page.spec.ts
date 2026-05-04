import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { CartStore } from '@core/stores/cart.store';
import {
  Product,
  ProductDetail,
} from '@core/interfaces/product.interface';
import { ShareService } from '../../services/share.service';
import { ProductDetailNativePage } from './product-detail-native.page';

const product: ProductDetail = {
  id: '1',
  slug: 'edr-pro',
  name: 'EDR Pro',
  description: 'Endpoint detection',
  shortDescription: 'EDR',
  productType: 'saas',
  priceMonthly: 49,
  isAvailable: true,
  isFeatured: false,
};
const physicalProduct: ProductDetail = {
  ...product,
  id: '2',
  slug: 'firewall',
  productType: 'physical',
  priceMonthly: undefined,
  priceUnit: 199,
};

describe('ProductDetailNativePage', () => {
  let fixture: ComponentFixture<ProductDetailNativePage>;
  let component: ProductDetailNativePage;
  let productStore: jasmine.SpyObj<ProductStore>;
  let cartStore: jasmine.SpyObj<CartStore>;
  let shareService: jasmine.SpyObj<ShareService>;
  let location: jasmine.SpyObj<Location>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  function setup(initial: ProductDetail = product): void {
    productStore = jasmine.createSpyObj<ProductStore>('ProductStore', [
      'fetchProductBySlug',
      'fetchSimilarProducts',
    ]);
    productStore.fetchProductBySlug.and.returnValue(of(initial));
    productStore.fetchSimilarProducts.and.returnValue(
      of([] as Product[]),
    );
    cartStore = jasmine.createSpyObj<CartStore>('CartStore', ['addItem']);
    shareService = jasmine.createSpyObj<ShareService>('ShareService', [
      'share',
    ]);
    shareService.share.and.resolveTo(true);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    paramMap$ = new BehaviorSubject(convertToParamMap({ slug: initial.slug }));

    TestBed.configureTestingModule({
      imports: [ProductDetailNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: productStore },
        { provide: CartStore, useValue: cartStore },
        { provide: ShareService, useValue: shareService },
        { provide: Location, useValue: location },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(ProductDetailNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads product on init from route param', () => {
    setup();
    expect(productStore.fetchProductBySlug).toHaveBeenCalledWith('edr-pro');
    expect(component.product()).toEqual(product);
    expect(component.isSaas()).toBe(true);
  });

  it('detects physical products', () => {
    setup(physicalProduct);
    expect(component.isSaas()).toBe(false);
  });

  it('navigates back through Location.back()', () => {
    setup();
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('shares the product through ShareService', async () => {
    setup();
    await component.share();
    expect(shareService.share).toHaveBeenCalled();
    const arg = shareService.share.calls.mostRecent().args[0];
    expect(arg.title).toBe('EDR Pro');
  });

  it('clamps quantity between 1 and 99', () => {
    setup(physicalProduct);
    component.decrementQty();
    expect(component.quantity()).toBe(1);
    for (let i = 0; i < 100; i++) component.incrementQty();
    expect(component.quantity()).toBe(99);
  });

  it('addToCart calls cartStore for non-saas and sets addedToCart', () => {
    setup(physicalProduct);
    component.quantity.set(2);
    component.addToCart();
    expect(cartStore.addItem).toHaveBeenCalledWith('2', 2);
    expect(component.addedToCart()).toBe(true);
  });

  it('addToCart is a no-op on SaaS products', () => {
    setup();
    component.addToCart();
    expect(cartStore.addItem).not.toHaveBeenCalled();
  });

  it('subscribeToProduct navigates to /m/subscribe/:slug', () => {
    setup();
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate');
    component.subscribeToProduct();
    expect(navigate).toHaveBeenCalledWith(['/m/subscribe', 'edr-pro']);
  });
});
