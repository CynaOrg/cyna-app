import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { AlertController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AddressesTabComponent } from './addresses-tab.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

describe('AddressesTabComponent', () => {
  let fixture: ComponentFixture<AddressesTabComponent>;
  let page: AddressesTabComponent;
  let store: any;
  let router: { navigate: jasmine.Spy };

  const address: UserAddress = {
    id: 'a1',
    label: 'Home',
    recipientName: 'Alice',
    street: '1 rue de la Paix',
    streetLine2: null,
    city: 'Paris',
    postalCode: '75001',
    state: null,
    country: 'FR',
    phone: null,
    isDefaultShipping: false,
    isDefaultBilling: false,
  } as unknown as UserAddress;

  beforeEach(async () => {
    store = {
      load: jasmine.createSpy('load'),
      create: jasmine.createSpy('create').and.returnValue(of({})),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      remove: jasmine.createSpy('remove').and.returnValue(of(undefined)),
      data$: new BehaviorSubject<UserAddress[] | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
    };

    router = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [
        AddressesTabComponent,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UserAddressStore, useValue: store },
        { provide: Router, useValue: router },
        {
          provide: AlertController,
          useValue: { create: jasmine.createSpy('create') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressesTabComponent);
    page = fixture.componentInstance;
  });

  it('calls store.load on ngOnInit', () => {
    page.ngOnInit();
    expect(store.load).toHaveBeenCalled();
  });

  it('goToNew navigates to the new-address route', () => {
    page.goToNew();
    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard/account/addresses/new',
    ]);
  });

  it('goToEdit navigates to the edit route with the given id', () => {
    page.goToEdit('a1');
    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard/account/addresses/edit',
      'a1',
    ]);
  });

  it('setDefaultShippingById no-ops when address is already default', () => {
    page.setDefaultShippingById('a1', [
      { ...address, isDefaultShipping: true },
    ]);
    expect(store.update).not.toHaveBeenCalled();
  });

  it('setDefaultShippingById calls store.update when flag flips', () => {
    page.setDefaultShippingById('a1', [address]);
    expect(store.update).toHaveBeenCalledWith('a1', {
      isDefaultShipping: true,
    });
  });

  it('setDefaultBillingById calls store.update when flag flips', () => {
    page.setDefaultBillingById('a1', [address]);
    expect(store.update).toHaveBeenCalledWith('a1', {
      isDefaultBilling: true,
    });
  });
});
