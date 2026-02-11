export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
}

export interface ShippingAddress extends Address {
  recipientName: string;
  phone?: string;
}
