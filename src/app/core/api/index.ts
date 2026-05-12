import type { components } from './schema';

export type ApiSchemas = components['schemas'];

export type CreatePaymentIntentRequest = ApiSchemas['CheckoutPaymentIntentDto'];
export type PaymentIntentResponse = ApiSchemas['PaymentIntentResponseDto'];
export type AddressDto = ApiSchemas['AddressDto'];
