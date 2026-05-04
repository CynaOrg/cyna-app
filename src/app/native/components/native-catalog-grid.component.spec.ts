import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { NativeCatalogGridComponent } from './native-catalog-grid.component';

const products: Product[] = [
  {
    id: '1',
    slug: 'firewall',
    name: 'Firewall Pro',
    productType: 'physical',
    priceUnit: 199,
    isAvailable: true,
    isFeatured: false,
  },
];

describe('NativeCatalogGridComponent', () => {
  let fixture: ComponentFixture<NativeCatalogGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NativeCatalogGridComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NativeCatalogGridComponent);
  });

  it('shows skeletons when loading and empty', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.animate-pulse')).length).toBe(
      6 * 3, // 6 cards × 3 placeholder bars per card
    );
  });

  it('renders product anchors with the configured prefix', () => {
    fixture.componentRef.setInput('products', products);
    fixture.componentRef.setInput('routePrefix', '/m/products');
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));
    expect(anchor).toBeTruthy();
    expect(anchor.nativeElement.getAttribute('href')).toBe(
      '/m/products/firewall',
    );
  });

  it('shows the empty state when there are no products', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CATALOG.EMPTY');
  });

  it('shows the error state when error is set', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('error', 'boom');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CATALOG.ERROR');
  });
});
