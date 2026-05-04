import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { NativeProductCardComponent } from './native-product-card.component';

const mockProduct: Product = {
  id: '1',
  slug: 'edr-pro',
  name: 'EDR Pro',
  productType: 'saas',
  priceMonthly: 49.99,
  isAvailable: true,
  isFeatured: false,
  categoryName: 'EDR',
  primaryImageUrl: 'https://example.com/edr.png',
};

describe('NativeProductCardComponent', () => {
  let component: NativeProductCardComponent;
  let fixture: ComponentFixture<NativeProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NativeProductCardComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NativeProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the product name', () => {
    const name = fixture.debugElement.query(By.css('h3'));
    expect(name.nativeElement.textContent.trim()).toBe('EDR Pro');
  });

  it('routes to /m/products/:slug by default', () => {
    expect(component.computedRoute()).toBe('/m/products/edr-pro');
  });

  it('respects a custom route prefix', () => {
    fixture.componentRef.setInput('routePrefix', '/m/services');
    fixture.detectChanges();
    expect(component.computedRoute()).toBe('/m/services/edr-pro');
  });

  it('renders an unavailable note when isAvailable is false', () => {
    fixture.componentRef.setInput('product', {
      ...mockProduct,
      isAvailable: false,
    });
    fixture.detectChanges();
    const unavailable = fixture.debugElement.query(
      By.css('p[style*="color: #ef4444"]'),
    );
    expect(unavailable).toBeTruthy();
  });

  it('shows the SVG fallback when no image is provided', () => {
    fixture.componentRef.setInput('product', {
      ...mockProduct,
      primaryImageUrl: undefined,
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('svg'))).toBeTruthy();
  });
});
