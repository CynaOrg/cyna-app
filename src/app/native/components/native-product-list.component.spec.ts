import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { NativeProductListComponent } from './native-product-list.component';

const products: Product[] = [
  {
    id: '1',
    slug: 'edr',
    name: 'EDR',
    productType: 'saas',
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: '2',
    slug: 'soc',
    name: 'SOC',
    productType: 'saas',
    isAvailable: true,
    isFeatured: false,
  },
];

describe('NativeProductListComponent', () => {
  let fixture: ComponentFixture<NativeProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NativeProductListComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NativeProductListComponent);
  });

  it('renders skeletons while loading', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const skeletons = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders one card per product when loaded', () => {
    fixture.componentRef.setInput('products', products);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('title', 'Top services');
    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(
      By.css('app-native-product-card'),
    );
    expect(cards.length).toBe(2);
  });

  it('renders the section title and link when both are provided', () => {
    fixture.componentRef.setInput('products', products);
    fixture.componentRef.setInput('title', 'Top services');
    fixture.componentRef.setInput('linkText', 'Voir tout');
    fixture.componentRef.setInput('linkRoute', '/m/services');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Top services');
    const link = fixture.debugElement.query(By.css('a[href]'));
    expect(link).toBeTruthy();
  });

  it('shows an empty state when there are no products', () => {
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('p.text-text-muted')),
    ).toBeTruthy();
  });
});
