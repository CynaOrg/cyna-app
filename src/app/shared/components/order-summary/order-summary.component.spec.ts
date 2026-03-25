import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { OrderSummaryComponent } from './order-summary.component';
import { CartItemResponse } from '@core/interfaces/cart.interface';

const mockItems: CartItemResponse[] = [
  {
    id: 'item-1',
    productId: 'prod-1',
    quantity: 2,
    billingPeriod: 'monthly',
    product: {
      nameFr: 'Produit SOC',
      nameEn: 'SOC Product',
      slug: 'soc-product',
      productType: 'saas',
      priceMonthly: 29.99,
      priceYearly: null,
      priceUnit: null,
      isAvailable: true,
      stockQuantity: null,
      images: [],
    },
  },
  {
    id: 'item-2',
    productId: 'prod-2',
    quantity: 1,
    billingPeriod: 'once',
    product: {
      nameFr: 'Cle USB',
      nameEn: 'USB Key',
      slug: 'usb-key',
      productType: 'physical',
      priceMonthly: null,
      priceYearly: null,
      priceUnit: 49.0,
      isAvailable: true,
      stockQuantity: 10,
      images: [],
    },
  },
];

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent;
  let fixture: ComponentFixture<OrderSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display order items', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('subtotal', 108.98);
    fixture.componentRef.setInput('total', 108.98);
    fixture.detectChanges();

    const itemElements = fixture.debugElement.queryAll(
      By.css('.flex.items-center.justify-between.gap-2'),
    );
    expect(itemElements.length).toBe(2);
  });

  it('should display subtotal and total', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('subtotal', 108.98);
    fixture.componentRef.setInput('total', 108.98);
    fixture.detectChanges();

    const nativeEl = fixture.nativeElement as HTMLElement;
    const text = nativeEl.textContent ?? '';
    expect(text).toContain('108.98');
  });

  it('should show shipping section when showShipping is true', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('subtotal', 100);
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('showShipping', true);
    fixture.detectChanges();

    const nativeEl = fixture.nativeElement as HTMLElement;
    // The shipping section uses CHECKOUT.SHIPPING and CHECKOUT.FREE translate keys
    // With TranslateModule.forRoot() and no translations, the key itself is rendered
    expect(nativeEl.textContent).toContain('CHECKOUT.SHIPPING');
  });

  it('should hide shipping section when showShipping is false', () => {
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('subtotal', 100);
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('showShipping', false);
    fixture.detectChanges();

    const nativeEl = fixture.nativeElement as HTMLElement;
    expect(nativeEl.textContent).not.toContain('CHECKOUT.SHIPPING');
  });

  it('should calculate item price correctly', () => {
    const price = component.getItemPrice(mockItems[0]);
    // 29.99 * 2 = 59.98
    expect(price).toBeCloseTo(59.98, 2);
  });

  it('should use priceUnit when priceMonthly is null', () => {
    const price = component.getItemPrice(mockItems[1]);
    // 49.00 * 1 = 49.00
    expect(price).toBe(49.0);
  });
});
