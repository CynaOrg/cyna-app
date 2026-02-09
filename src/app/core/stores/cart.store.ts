import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';
import { CartItem } from '../interfaces/cart.interface';
import { Product } from '../interfaces/product.interface';
import { PreferencesService } from '../services/preferences.service';

const CART_STORAGE_KEY = 'cart_items';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private readonly preferences = inject(PreferencesService);

  private readonly itemsSubject$ = new BehaviorSubject<CartItem[]>([]);

  readonly items$: Observable<CartItem[]> = this.itemsSubject$
    .asObservable()
    .pipe(distinctUntilChanged());

  readonly count$: Observable<number> = this.itemsSubject$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
    distinctUntilChanged(),
  );

  readonly total$: Observable<number> = this.itemsSubject$.pipe(
    map((items) =>
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    ),
    distinctUntilChanged(),
  );

  readonly isEmpty$: Observable<boolean> = this.itemsSubject$.pipe(
    map((items) => items.length === 0),
    distinctUntilChanged(),
  );

  addItem(product: Product, quantity = 1): void {
    const items = [...this.itemsSubject$.getValue()];
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        existing.maxQuantity,
      );
    } else {
      items.push({
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        imageUrl: product.primaryImageUrl ?? '',
        unitPrice: product.priceUnit ?? product.priceMonthly ?? 0,
        quantity,
        maxQuantity: 99,
        productType:
          product.productType === 'saas'
            ? 'digital'
            : (product.productType as 'physical' | 'digital'),
      });
    }

    this.itemsSubject$.next(items);
    this.persist();
  }

  removeItem(productId: string): void {
    const items = this.itemsSubject$
      .getValue()
      .filter((i) => i.productId !== productId);
    this.itemsSubject$.next(items);
    this.persist();
  }

  updateQuantity(productId: string, quantity: number): void {
    const items = [...this.itemsSubject$.getValue()];
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    item.quantity = Math.max(1, Math.min(quantity, item.maxQuantity));
    this.itemsSubject$.next(items);
    this.persist();
  }

  clear(): void {
    this.itemsSubject$.next([]);
    this.persist();
  }

  async loadFromStorage(): Promise<void> {
    const items = await this.preferences.get<CartItem[]>(CART_STORAGE_KEY);
    if (items?.length) {
      this.itemsSubject$.next(items);
    }
  }

  private persist(): void {
    this.preferences.set(CART_STORAGE_KEY, this.itemsSubject$.getValue());
  }
}
