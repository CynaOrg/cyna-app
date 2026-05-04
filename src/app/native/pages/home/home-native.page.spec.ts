import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { HomeNativePage } from './home-native.page';

const saas: Product = {
  id: '1',
  slug: 'soc',
  name: 'SOC',
  productType: 'saas',
  isAvailable: true,
  isFeatured: false,
};
const physical: Product = {
  id: '2',
  slug: 'firewall',
  name: 'Firewall',
  productType: 'physical',
  isAvailable: true,
  isFeatured: false,
};

describe('HomeNativePage', () => {
  let fixture: ComponentFixture<HomeNativePage>;
  let component: HomeNativePage;
  let store: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    saasProducts$: BehaviorSubject<Product[]>;
    products$: BehaviorSubject<Product[]>;
  };

  beforeEach(async () => {
    const isLoading$ = new BehaviorSubject<boolean>(false);
    const error$ = new BehaviorSubject<string | null>(null);
    const saasProducts$ = new BehaviorSubject<Product[]>([saas]);
    const products$ = new BehaviorSubject<Product[]>([saas, physical]);
    store = {
      isLoading$,
      error$,
      saasProducts$,
      products$,
      fetchProducts: jasmine
        .createSpy('fetchProducts')
        .and.returnValue(of([saas, physical])),
    } as unknown as typeof store;

    await TestBed.configureTestingModule({
      imports: [HomeNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and fetches products on init', () => {
    expect(component).toBeTruthy();
    expect(store.fetchProducts).toHaveBeenCalledWith({ limit: 20 });
  });

  it('keeps services and physical products separate', () => {
    expect(component.services()).toEqual([saas]);
    expect(component.products()).toEqual([physical]);
  });

  it('completes the refresher event on refresh', () => {
    const complete = jasmine.createSpy('complete');
    const event = { target: { complete } } as unknown as CustomEvent;
    component.refresh(event);
    expect(complete).toHaveBeenCalled();
  });
});
