import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProductListComponent } from './product-list.component';
import { Product } from '@core/interfaces/product.interface';

const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'product-1',
    name: 'Product 1',
    productType: 'saas',
    priceMonthly: 10,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '2',
    slug: 'product-2',
    name: 'Product 2',
    productType: 'physical',
    priceUnit: 50,
    isAvailable: true,
    isFeatured: false,
  },
];

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('products', mockProducts);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show loading spinner when isLoading is true', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinner).toBeTruthy();
  });

  it('should show error message when error is set', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('error', 'Something went wrong');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('p.text-text-muted'));
    expect(errorEl).toBeTruthy();
  });

  it('should show empty state when products array is empty', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const emptyEl = fixture.debugElement.query(By.css('p.text-text-muted'));
    expect(emptyEl).toBeTruthy();
  });

  it('should render product cards for each product', () => {
    fixture.componentRef.setInput('products', mockProducts);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-product-card'));
    // Browser variant renders cards twice: mobile scroll + desktop grid
    expect(cards.length).toBe(mockProducts.length * 2);
  });

  it('should show header with title when showHeader is true', () => {
    fixture.componentRef.setInput('products', mockProducts);
    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('title', 'Featured Products');
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('app-section-header'));
    expect(header).toBeTruthy();
  });

  it('should hide header when showHeader is false', () => {
    fixture.componentRef.setInput('products', mockProducts);
    fixture.componentRef.setInput('showHeader', false);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('app-section-header'));
    expect(header).toBeNull();
  });
});
