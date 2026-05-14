import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryCardsComponent } from './category-cards.component';

describe('CategoryCardsComponent', () => {
  let fixture: ComponentFixture<CategoryCardsComponent>;
  let component: CategoryCardsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoryCardsComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('exposes a non-empty cards list', () => {
    expect(component.cards.length).toBeGreaterThan(0);
    expect(component.cards.every((c) => c.route && c.titleKey)).toBeTrue();
  });

  it('renders one card per entry', () => {
    const cards = fixture.debugElement.queryAll(By.css('.feature-card'));
    expect(cards.length).toBe(component.cards.length);
  });
});
