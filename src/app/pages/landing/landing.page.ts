import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  standalone: false,
})
export class LandingPage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  services: Product[] = [];
  products: Product[] = [];
  licenses: Product[] = [];
  isLoading = false;
  error: string | null = null;

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

    this.productStore.licenseProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => (this.licenses = products));

    this.productStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products = products.filter(
          (p) => p.productType !== 'saas' && p.productType !== 'license',
        );
      });

    this.productStore
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
