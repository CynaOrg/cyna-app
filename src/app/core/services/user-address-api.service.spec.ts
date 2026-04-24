import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserAddressApiService } from './user-address-api.service';
import { ApiService } from './api.service';
import {
  UserAddress,
  UpsertUserAddressPayload,
} from '../interfaces/user-address.interface';

describe('UserAddressApiService', () => {
  let service: UserAddressApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockAddress: UserAddress = {
    id: 'a1',
    label: 'Bureau',
    recipientName: 'Alice',
    street: '1 rue de Paris',
    city: 'Paris',
    postalCode: '75001',
    country: 'FR',
    isDefaultShipping: true,
    isDefaultBilling: false,
    createdAt: '2026-04-24T00:00:00Z',
    updatedAt: '2026-04-24T00:00:00Z',
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', [
      'get',
      'post',
      'patch',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UserAddressApiService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(UserAddressApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list hits GET users/me/addresses', () => {
    apiSpy.get.and.returnValue(of([mockAddress]));

    service.list().subscribe((res) => {
      expect(res).toEqual([mockAddress]);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('users/me/addresses');
  });

  it('create hits POST users/me/addresses with payload', () => {
    const payload: UpsertUserAddressPayload = { label: 'X' } as any;
    apiSpy.post.and.returnValue(of(mockAddress));

    service.create(payload).subscribe();

    expect(apiSpy.post).toHaveBeenCalledWith('users/me/addresses', payload);
  });

  it('update hits PATCH users/me/addresses/:id', () => {
    const payload = { label: 'Y' } as Partial<UpsertUserAddressPayload>;
    apiSpy.patch.and.returnValue(of(mockAddress));

    service.update('a1', payload).subscribe();

    expect(apiSpy.patch).toHaveBeenCalledWith('users/me/addresses/a1', payload);
  });

  it('delete hits DELETE users/me/addresses/:id', () => {
    apiSpy.delete.and.returnValue(of(undefined));

    service.delete('a1').subscribe();

    expect(apiSpy.delete).toHaveBeenCalledWith('users/me/addresses/a1');
  });
});
