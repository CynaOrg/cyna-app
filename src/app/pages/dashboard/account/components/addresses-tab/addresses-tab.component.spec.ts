import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AddressesTabComponent } from './addresses-tab.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

describe('AddressesTabComponent', () => {
  let fixture: ComponentFixture<AddressesTabComponent>;
  let page: AddressesTabComponent;
  let store: any;

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

    await TestBed.configureTestingModule({
      imports: [
        AddressesTabComponent,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UserAddressStore, useValue: store },
        {
          provide: ModalController,
          useValue: { create: jasmine.createSpy('create') },
        },
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

  it('setDefaultShipping no-ops when address is already default', () => {
    page.setDefaultShipping({
      id: 'a1',
      isDefaultShipping: true,
    } as UserAddress);
    expect(store.update).not.toHaveBeenCalled();
  });

  it('setDefaultShipping calls store.update when flag flips', () => {
    page.setDefaultShipping({
      id: 'a1',
      isDefaultShipping: false,
    } as UserAddress);
    expect(store.update).toHaveBeenCalledWith('a1', {
      isDefaultShipping: true,
    });
  });
});
