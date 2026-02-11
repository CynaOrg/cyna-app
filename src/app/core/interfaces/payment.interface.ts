export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface SetupIntentResponse {
  clientSecret: string;
}
