import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { ServicesNativePage } from './services-native.page';

const saas: Product = {
  id: '1',
  slug: 'soc',
  name: 'SOC',
  productType: 'saas',
  isAvailable: true,
  isFeatured: false,
};

describe('ServicesNativePage', () => {
  let fixture: ComponentFixture<ServicesNativePage>;
  let component: ServicesNativePage;
  let store: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    saasProducts$: BehaviorSubject<Product[]>;
  };

  beforeEach(async () => {
    store = {
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      saasProducts$: new BehaviorSubject<Product[]>([saas]),
      fetchByType: jasmine.createSpy('fetchByType').and.returnValue(of([saas])),
    } as unknown as typeof store;

    await TestBed.configureTestingModule({
      imports: [ServicesNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches SaaS services on init', () => {
    expect(component).toBeTruthy();
    expect(store.fetchByType).toHaveBeenCalledWith('saas', 50);
    expect(component.services()).toEqual([saas]);
  });

  it('completes the refresher on refresh', () => {
    const complete = jasmine.createSpy('complete');
    component.refresh({ target: { complete } } as unknown as CustomEvent);
    expect(complete).toHaveBeenCalled();
  });
});
