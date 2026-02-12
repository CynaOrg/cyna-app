export interface Subscription {
  id: string;
  productId: string;
  productName: string;
  status: string;
  priceMonthly?: number;
  priceYearly?: number;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
}
