import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { ServicesPage } from './services.page';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

describe('ServicesPage', () => {
  let component: ServicesPage;
  let fixture: ComponentFixture<ServicesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServicesPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesPage);
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
      tick();
      expect(component.showCatalog).toBe(true);
      tick(400);
      expect(refresher.complete).toHaveBeenCalledTimes(1);
    }));
  });
});
