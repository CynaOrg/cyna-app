import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { ProductsNativePage } from './products-native.page';

const physical: Product = {
  id: '1',
  slug: 'firewall',
  name: 'Firewall',
  productType: 'physical',
  isAvailable: true,
  isFeatured: false,
};

describe('ProductsNativePage', () => {
  let fixture: ComponentFixture<ProductsNativePage>;
  let component: ProductsNativePage;
  let store: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    physicalProducts$: BehaviorSubject<Product[]>;
  };

  beforeEach(async () => {
    store = {
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      physicalProducts$: new BehaviorSubject<Product[]>([physical]),
      fetchByType: jasmine
        .createSpy('fetchByType')
        .and.returnValue(of([physical])),
    } as unknown as typeof store;

    await TestBed.configureTestingModule({
      imports: [ProductsNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches physical products on init', () => {
    expect(component).toBeTruthy();
    expect(store.fetchByType).toHaveBeenCalledWith('physical', 50);
    expect(component.products()).toEqual([physical]);
  });

  it('completes the refresher on refresh', () => {
    const complete = jasmine.createSpy('complete');
    component.refresh({ target: { complete } } as unknown as CustomEvent);
    expect(complete).toHaveBeenCalled();
  });
});
