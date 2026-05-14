import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TopbarActionsComponent } from './topbar-actions.component';
import { CartStore } from '@core/stores/cart.store';
import { SearchService } from '@core/services/search.service';

describe('TopbarActionsComponent', () => {
  let fixture: ComponentFixture<TopbarActionsComponent>;
  let component: TopbarActionsComponent;
  let searchService: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    const cartStore = { count$: of(0) };
    searchService = jasmine.createSpyObj('SearchService', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        TopbarActionsComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: CartStore, useValue: cartStore },
        { provide: SearchService, useValue: searchService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(TopbarActionsComponent);
    component = fixture.componentInstance;
    TestBed.inject(TranslateService).setDefaultLang('fr');
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('openSearch triggers SearchService.open', () => {
    component.openSearch();
    expect(searchService.open).toHaveBeenCalled();
  });

  it('toggleLanguage flips currentLang fr↔en', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('fr');
    component.toggleLanguage();
    expect(component.currentLang()).toBe('en');
    component.toggleLanguage();
    expect(component.currentLang()).toBe('fr');
  });

  it('bgColor / fgColor adapt to invertColors', () => {
    expect(component.bgColor()).toBe('#f6f6f6');
    fixture.componentRef.setInput('invertColors', true);
    fixture.detectChanges();
    expect(component.bgColor()).toBe('rgba(255,255,255,0.1)');
    expect(component.fgColor()).toBe('#fafafa');
  });

  it('renders three control buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button, a'));
    expect(buttons.length).toBe(3);
  });
});
