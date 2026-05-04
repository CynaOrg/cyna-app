import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { CatalogNativePage } from './catalog-native.page';

const featured: Product = {
  id: '1',
  slug: 'edr-pro',
  name: 'EDR Pro',
  productType: 'saas',
  isAvailable: true,
  isFeatured: true,
};

describe('CatalogNativePage', () => {
  let fixture: ComponentFixture<CatalogNativePage>;
  let component: CatalogNativePage;
  let store: jasmine.SpyObj<ProductStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    featured$: BehaviorSubject<Product[]>;
  };

  beforeEach(async () => {
    store = {
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      featured$: new BehaviorSubject<Product[]>([featured]),
      fetchProducts: jasmine
        .createSpy('fetchProducts')
        .and.returnValue(of([featured])),
    } as unknown as typeof store;

    await TestBed.configureTestingModule({
      imports: [CatalogNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with featured products', () => {
    expect(component).toBeTruthy();
    expect(component.featured().length).toBe(1);
  });

  it('renders the three hub cards (Services / Produits / Licences)', () => {
    const links = fixture.debugElement.queryAll(By.css('a[href^="/m/"]'));
    const hrefs = links.map((l) => l.nativeElement.getAttribute('href'));
    expect(hrefs).toContain('/m/services');
    expect(hrefs).toContain('/m/products');
    expect(hrefs).toContain('/m/licenses');
  });

  it('completes the refresher event on refresh', () => {
    const complete = jasmine.createSpy('complete');
    const event = { target: { complete } } as unknown as CustomEvent;
    component.refresh(event);
    expect(complete).toHaveBeenCalled();
  });
});
