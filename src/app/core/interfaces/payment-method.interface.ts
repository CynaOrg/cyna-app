export interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
