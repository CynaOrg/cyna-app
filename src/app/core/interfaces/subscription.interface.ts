export interface Subscription {
  id: string;
  productId: string;
  productName: string | null;
  status: string;
  price: number;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
}
