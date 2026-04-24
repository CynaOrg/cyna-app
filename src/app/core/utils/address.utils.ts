import { Address, ShippingAddress } from '../interfaces';
import { UserAddress } from '../interfaces/user-address.interface';

export function toAddressSnapshot(
  ua: UserAddress,
): Address & Partial<ShippingAddress> {
  const street = ua.streetLine2 ? `${ua.street} ${ua.streetLine2}` : ua.street;
  return {
    street,
    city: ua.city,
    postalCode: ua.postalCode,
    country: ua.country,
    state: ua.state,
    recipientName: ua.recipientName,
    phone: ua.phone,
  };
}
