import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { SearchResultItemComponent } from './search-result-item.component';
import { Product } from '@core/interfaces/product.interface';

const stub = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    slug: 'p1',
    name: 'Product',
    productType: 'saas',
    priceMonthly: 10,
    isAvailable: true,
    isFeatured: false,
    ...overrides,
  }) as Product;

describe('SearchResultItemComponent', () => {
  let fixture: ComponentFixture<SearchResultItemComponent>;
  let component: SearchResultItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultItemComponent, TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchResultItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', stub());
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits selected with the product when clicked', () => {
    fixture.detectChanges();
    spyOn(component.selected, 'emit');
    const btn = fixture.debugElement.query(By.css('button'));
    btn.nativeElement.click();
    expect(component.selected.emit).toHaveBeenCalledWith(stub());
  });

  it('typeIcon maps each productType', () => {
    fixture.componentRef.setInput('product', stub({ productType: 'saas' }));
    fixture.detectChanges();
    expect(component.typeIcon()).toBe('phosphorCloudArrowUp');

    fixture.componentRef.setInput('product', stub({ productType: 'physical' }));
    expect(component.typeIcon()).toBe('phosphorPackage');

    fixture.componentRef.setInput('product', stub({ productType: 'license' }));
    expect(component.typeIcon()).toBe('phosphorKey');
  });

  it('typeLabel maps each productType', () => {
    fixture.componentRef.setInput('product', stub({ productType: 'saas' }));
    fixture.detectChanges();
    expect(component.typeLabel()).toBe('Service');

    fixture.componentRef.setInput('product', stub({ productType: 'physical' }));
    expect(component.typeLabel()).toBe('Product');

    fixture.componentRef.setInput('product', stub({ productType: 'license' }));
    expect(component.typeLabel()).toBe('License');
  });

  it('price formats priceMonthly with €/mo suffix', () => {
    fixture.componentRef.setInput('product', stub({ priceMonthly: 12 }));
    fixture.detectChanges();
    expect(component.price()).toBe('12€/mo');
  });

  it('price falls back to priceUnit', () => {
    fixture.componentRef.setInput(
      'product',
      stub({ priceMonthly: undefined, priceUnit: 42 }),
    );
    fixture.detectChanges();
    expect(component.price()).toBe('42€');
  });

  it('price returns null when no price', () => {
    fixture.componentRef.setInput(
      'product',
      stub({ priceMonthly: undefined, priceUnit: undefined }),
    );
    fixture.detectChanges();
    expect(component.price()).toBeNull();
  });
});
