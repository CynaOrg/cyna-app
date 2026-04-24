export interface UserAddress {
  id: string;
  label: string;
  recipientName: string;
  street: string;
  streetLine2?: string;
  city: string;
  postalCode: string;
  state?: string;
  country: string;
  phone?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpsertUserAddressPayload = Omit<
  UserAddress,
  'id' | 'createdAt' | 'updatedAt'
>;
