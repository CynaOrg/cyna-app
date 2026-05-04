import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { ProductsPage } from './products.page';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

describe('ProductsPage', () => {
  let component: ProductsPage;
  let fixture: ComponentFixture<ProductsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the catalog by default', () => {
    expect(component.showCatalog).toBe(true);
  });

  describe('onRefresh', () => {
    it('re-mounts the catalog and calls complete() on the refresher', fakeAsync(() => {
      const refresher = jasmine.createSpyObj<PullToRefreshComponent>(
        'PullToRefreshComponent',
        ['complete'],
      );
      refresher.complete.and.resolveTo();
      component.refresher = refresher;

      void component.onRefresh();
      // microtask: showCatalog flips back to true
      tick();
      expect(component.showCatalog).toBe(true);
      // setTimeout(_, 400) before complete()
      tick(400);
      expect(refresher.complete).toHaveBeenCalledTimes(1);
    }));
  });
});
