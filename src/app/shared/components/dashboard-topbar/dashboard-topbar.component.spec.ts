import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DashboardTopBarComponent } from './dashboard-topbar.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

describe('DashboardTopBarComponent', () => {
  let fixture: ComponentFixture<DashboardTopBarComponent>;
  let component: DashboardTopBarComponent;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    await TestBed.configureTestingModule({
      imports: [
        DashboardTopBarComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: Location, useValue: locationSpy },
        { provide: CartStore, useValue: { count$: of(0) } },
        {
          provide: SearchService,
          useValue: { open: jasmine.createSpy('open') },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardTopBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Dashboard');
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the desktop variant by default', () => {
    fixture.detectChanges();
    const desktop = fixture.debugElement.query(By.css('.hidden.lg\\:block'));
    expect(desktop).toBeTruthy();
  });

  it('renders the mobile variant when mobileOnly=true', () => {
    fixture.componentRef.setInput('mobileOnly', true);
    fixture.detectChanges();
    const mobile = fixture.debugElement.query(By.css('.lg\\:hidden'));
    expect(mobile).toBeTruthy();
  });

  it('renders the back button when showBack=true', () => {
    fixture.componentRef.setInput('showBack', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('goBack() invokes Location.back', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
