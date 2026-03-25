import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from './product-card.component';
import { Product } from '@core/interfaces/product.interface';

const mockProduct: Product = {
  id: '1',
  slug: 'test-product',
  name: 'Test Product',
  productType: 'saas',
  priceMonthly: 29.99,
  isAvailable: true,
  isFeatured: false,
  categoryName: 'SOC',
  primaryImageUrl: 'https://example.com/image.png',
};

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductCardComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create with product input', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const name = fixture.debugElement.query(By.css('h3'));
    expect(name.nativeElement.textContent.trim()).toBe('Test Product');
  });

  it('should display product category', () => {
    const category = fixture.debugElement.query(
      By.css('p[style*="color: #9ca3af"]'),
    );
    expect(category).toBeTruthy();
    expect(category.nativeElement.textContent.trim()).toBe('SOC');
  });

  it('should show monthly price when available', () => {
    const priceEl = fixture.debugElement.query(
      By.css('span[style*="color: #0a0a0a"]'),
    );
    expect(priceEl).toBeTruthy();
    expect(priceEl.nativeElement.textContent).toContain('29.99');
  });

  it('should show unit price when available', () => {
    const unitProduct: Product = {
      ...mockProduct,
      priceMonthly: undefined,
      priceUnit: 199,
    };
    fixture.componentRef.setInput('product', unitProduct);
    fixture.detectChanges();

    const priceEl = fixture.debugElement.query(
      By.css('span[style*="color: #0a0a0a"]'),
    );
    expect(priceEl).toBeTruthy();
    expect(priceEl.nativeElement.textContent).toContain('199');
  });

  it('should show "unavailable" badge when product is not available', () => {
    const unavailableProduct: Product = {
      ...mockProduct,
      isAvailable: false,
    };
    fixture.componentRef.setInput('product', unavailableProduct);
    fixture.detectChanges();

    const unavailable = fixture.debugElement.query(
      By.css('p[style*="color: #ef4444"]'),
    );
    expect(unavailable).toBeTruthy();
  });

  it('should use fallback image when no image URL', () => {
    const noImageProduct: Product = {
      ...mockProduct,
      primaryImageUrl: undefined,
    };
    fixture.componentRef.setInput('product', noImageProduct);
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeNull();

    const fallbackSvg = fixture.debugElement.query(By.css('svg'));
    expect(fallbackSvg).toBeTruthy();
  });
});
