import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MobileHeaderComponent } from './mobile-header.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

describe('MobileHeaderComponent', () => {
  let fixture: ComponentFixture<MobileHeaderComponent>;
  let component: MobileHeaderComponent;
  let location: jasmine.SpyObj<Location>;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    location = jasmine.createSpyObj('Location', ['back']);
    searchService = jasmine.createSpyObj('SearchService', ['open']);
    await TestBed.configureTestingModule({
      imports: [
        MobileHeaderComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: Location, useValue: location },
        { provide: CartStore, useValue: { count$: of(0) } },
        { provide: SearchService, useValue: searchService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(MobileHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'PAGE.TITLE');
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('goBack calls Location.back', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('openSearch invokes SearchService.open', () => {
    component.openSearch();
    expect(searchService.open).toHaveBeenCalled();
  });
});
