/**
 * Single source of truth for the VAT rate applied across the client UI.
 *
 * Prices in the API are stored Hors Taxe (HT) — `Subscription.price`,
 * `OrderItem.unitPrice`, `Order.subtotal` — and the TVA is applied at
 * display time. Centralizing the rate here means a future repreneur can
 * switch to 5.5%, 0% (export) or 21% (BE) by editing a single line.
 *
 * The matching backend constant lives in `libs/common/src/constants/tax.constants.ts`
 * inside the cyna-api repo — keep them in sync if the rate ever changes.
 */
export const VAT_RATE = 0.2;
export const VAT_MULTIPLIER = 1 + VAT_RATE;

export const toTtc = (ht: number): number => ht * VAT_MULTIPLIER;
export const toHt = (ttc: number): number => ttc / VAT_MULTIPLIER;
