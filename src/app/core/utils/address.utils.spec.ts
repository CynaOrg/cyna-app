import { toAddressSnapshot } from './address.utils';
import { UserAddress } from '../interfaces/user-address.interface';

describe('toAddressSnapshot', () => {
  const ua: UserAddress = {
    id: 'a1',
    label: 'Siège',
    recipientName: 'Alice',
    street: '1 rue',
    streetLine2: 'BAT A',
    city: 'Paris',
    postalCode: '75000',
    country: 'FR',
    state: 'IDF',
    phone: '0102030405',
    isDefaultShipping: true,
    isDefaultBilling: false,
    createdAt: '2026-04-24T00:00:00Z',
    updatedAt: '2026-04-24T00:00:00Z',
  };

  it('produces a checkout-snapshot Address from a UserAddress', () => {
    const snap = toAddressSnapshot(ua);
    expect(snap).toEqual({
      street: '1 rue BAT A',
      city: 'Paris',
      postalCode: '75000',
      country: 'FR',
      state: 'IDF',
      recipientName: 'Alice',
      phone: '0102030405',
    });
  });

  it('omits the BAT suffix when streetLine2 is absent', () => {
    const snap = toAddressSnapshot({ ...ua, streetLine2: undefined });
    expect(snap.street).toBe('1 rue');
  });
});
