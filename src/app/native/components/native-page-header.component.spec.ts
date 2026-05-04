import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NativePageHeaderComponent } from './native-page-header.component';

describe('NativePageHeaderComponent', () => {
  let fixture: ComponentFixture<NativePageHeaderComponent>;
  let location: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    await TestBed.configureTestingModule({
      imports: [NativePageHeaderComponent],
      providers: [{ provide: Location, useValue: location }],
    }).compileComponents();

    fixture = TestBed.createComponent(NativePageHeaderComponent);
  });

  it('renders the title', () => {
    fixture.componentRef.setInput('title', 'Produits');
    fixture.detectChanges();
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1.nativeElement.textContent.trim()).toBe('Produits');
  });

  it('shows a back button by default and calls Location.back', () => {
    fixture.componentRef.setInput('title', 'Detail');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    button.nativeElement.click();
    expect(location.back).toHaveBeenCalled();
  });

  it('hides the back button when showBack is false', () => {
    fixture.componentRef.setInput('title', 'Detail');
    fixture.componentRef.setInput('showBack', false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('button'))).toBeNull();
  });
});
