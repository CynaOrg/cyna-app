import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { LicensesNativePage } from './licenses-native.page';

const license: Product = {
  id: '1',
  slug: 'av-pro',
  name: 'AV Pro',
  productType: 'license',
  isAvailable: true,
  isFeatured: false,
};

describe('LicensesNativePage', () => {
  let fixture: ComponentFixture<LicensesNativePage>;
  let component: LicensesNativePage;
  let store: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    licenseProducts$: BehaviorSubject<Product[]>;
  };

  beforeEach(async () => {
    store = {
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      licenseProducts$: new BehaviorSubject<Product[]>([license]),
      fetchByType: jasmine
        .createSpy('fetchByType')
        .and.returnValue(of([license])),
    } as unknown as typeof store;

    await TestBed.configureTestingModule({
      imports: [LicensesNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LicensesNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches license products on init', () => {
    expect(component).toBeTruthy();
    expect(store.fetchByType).toHaveBeenCalledWith('license', 50);
    expect(component.licenses()).toEqual([license]);
  });

  it('completes the refresher on refresh', () => {
    const complete = jasmine.createSpy('complete');
    component.refresh({ target: { complete } } as unknown as CustomEvent);
    expect(complete).toHaveBeenCalled();
  });
});
