import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AddressCardComponent } from './address-card.component';
import { UserAddress } from '@core/interfaces/user-address.interface';

const addr: UserAddress = {
  id: 'a1',
  label: 'Siège',
  recipientName: 'Alice',
  street: '1 rue',
  streetLine2: 'BAT A',
  city: 'Paris',
  postalCode: '75000',
  country: 'FR',
  isDefaultShipping: true,
  isDefaultBilling: false,
  createdAt: '2026-04-24T00:00:00Z',
  updatedAt: '2026-04-24T00:00:00Z',
};

describe('AddressCardComponent', () => {
  let fixture: ComponentFixture<AddressCardComponent>;
  let component: AddressCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressCardComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressCardComponent);
    component = fixture.componentInstance;
  });

  it('renders label, street, city, country', () => {
    fixture.componentRef.setInput('address', addr);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Siège');
    expect(el.textContent).toContain('1 rue');
    expect(el.textContent).toContain('Paris');
    expect(el.textContent).toContain('FR');
  });

  it('emits select when clicked in selectable mode', () => {
    fixture.componentRef.setInput('address', addr);
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    const spy = jasmine.createSpy('select');
    component.cardSelect.subscribe(spy);
    (
      fixture.nativeElement.querySelector('[data-test="card"]') as HTMLElement
    ).click();
    expect(spy).toHaveBeenCalledWith('a1');
  });
});
