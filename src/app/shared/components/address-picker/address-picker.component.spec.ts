import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AddressPickerComponent } from './address-picker.component';
import { AuthStore } from '@core/stores/auth.store';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

const mkAddr = (id: string, over: Partial<UserAddress> = {}): UserAddress => ({
  id,
  label: id,
  recipientName: 'A',
  street: '1 rue',
  city: 'Paris',
  postalCode: '75000',
  country: 'FR',
  isDefaultShipping: false,
  isDefaultBilling: false,
  createdAt: '',
  updatedAt: '',
  ...over,
});

describe('AddressPickerComponent', () => {
  let fixture: ComponentFixture<AddressPickerComponent>;
  let component: AddressPickerComponent;
  let isAuth$: BehaviorSubject<boolean>;
  let data$: BehaviorSubject<UserAddress[] | null>;
  let store: {
    load: jasmine.Spy;
    data$: BehaviorSubject<UserAddress[] | null>;
    create: jasmine.Spy;
  };
  let auth: { isAuthenticated$: BehaviorSubject<boolean> };

  beforeEach(async () => {
    isAuth$ = new BehaviorSubject<boolean>(false);
    data$ = new BehaviorSubject<UserAddress[] | null>(null);
    store = {
      load: jasmine.createSpy('load'),
      data$,
      create: jasmine.createSpy('create').and.returnValue(of(mkAddr('new'))),
    };
    auth = { isAuthenticated$: isAuth$ };

    await TestBed.configureTestingModule({
      imports: [AddressPickerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthStore, useValue: auth },
        { provide: UserAddressStore, useValue: store },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressPickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'billing');
  });

  it('guest -> renders the form only', () => {
    isAuth$.next(false);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-address-form');
    expect(html).not.toContain('data-test="address-list"');
    expect(html).not.toContain('data-test="save-checkbox"');
  });

  it('authenticated + empty book -> form + save-to-book checkbox', () => {
    isAuth$.next(true);
    data$.next([]);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('app-address-form');
    expect(html).toContain('data-test="save-checkbox"');
  });

  it('authenticated + book has entries -> renders the list + add-new radio', () => {
    isAuth$.next(true);
    data$.next([mkAddr('a1', { isDefaultBilling: true }), mkAddr('a2')]);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('data-test="address-list"');
    expect(html).toContain('data-test="add-new"');
  });

  it('pre-selects the default for its type', () => {
    isAuth$.next(true);
    data$.next([mkAddr('a1'), mkAddr('a2', { isDefaultBilling: true })]);
    fixture.detectChanges();
    expect(component.selectedId()).toBe('a2');
  });

  it('emits addressChange when an existing entry is selected', () => {
    isAuth$.next(true);
    data$.next([mkAddr('a1', { isDefaultBilling: true }), mkAddr('a2')]);
    fixture.detectChanges();

    const spy = jasmine.createSpy('addressChange');
    component.addressChange.subscribe(spy);
    component.onSelect('a2');
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
