import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  isNative = isNativeCapacitor();
  services: Product[] = [];
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  scrolled = false;
  readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.scrolled = top > 50;
  }

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.isLoading = loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.error = error));

    this.productStore.saasProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => (this.services = products));

    this.productStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products = products.filter((p) => p.productType !== 'saas');
      });

    this.productStore
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
