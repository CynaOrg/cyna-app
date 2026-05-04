import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';

interface CatalogHubCard {
  titleKey: string;
  descriptionKey: string;
  ctaKey: string;
  route: string;
  image: string;
  accent: string;
}

@Component({
  selector: 'app-catalog-hub',
  templateUrl: 'catalog-hub.page.html',
  standalone: false,
})
export class CatalogHubPage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  featured: Product[] = [];
  isLoading = false;
  error: string | null = null;

  readonly cards: CatalogHubCard[] = [
    {
      titleKey: 'CATALOG_HUB.SERVICES_TITLE',
      descriptionKey: 'CATALOG_HUB.SERVICES_DESCRIPTION',
      ctaKey: 'CATALOG_HUB.SERVICES_CTA',
      route: '/services',
      image: 'assets/images/landing/feature-monitoring.jpg',
      accent: '#1447E6',
    },
    {
      titleKey: 'CATALOG_HUB.PRODUCTS_TITLE',
      descriptionKey: 'CATALOG_HUB.PRODUCTS_DESCRIPTION',
      ctaKey: 'CATALOG_HUB.PRODUCTS_CTA',
      route: '/products',
      image: 'assets/images/landing/feature-team.jpg',
      accent: '#0a0a0a',
    },
    {
      titleKey: 'CATALOG_HUB.LICENSES_TITLE',
      descriptionKey: 'CATALOG_HUB.LICENSES_DESCRIPTION',
      ctaKey: 'CATALOG_HUB.LICENSES_CTA',
      route: '/licenses',
      image: 'assets/images/landing/feature-analytics.jpg',
      accent: '#0a0a0a',
    },
  ];

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.isLoading = loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.error = error));

    this.productStore.featured$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => (this.featured = products));

    this.productStore
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Triggered by `<app-pull-to-refresh>`. Re-fetches products and
   * tells the refresher to terminate its spinner once data is back.
   */
  async onRefresh(refresher: PullToRefreshComponent): Promise<void> {
    try {
      await firstValueFrom(this.productStore.fetchProducts({ limit: 20 }));
    } finally {
      await refresher.complete();
    }
  }
}
