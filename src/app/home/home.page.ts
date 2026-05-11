import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  host: { class: 'ion-page' },
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly header = inject(MobileHeaderService);

  isNative = isNativeCapacitor();
  /** Last known scrolled state for this page; used to restore the glass
      topbar immediately when Ionic re-enters the cached page. */
  private cachedScrolled = false;
  services: Product[] = [];
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }

  ionViewWillEnter(): void {
    if (this.isNative) {
      this.header.configure({
        title: 'NAV.HOME',
        showSearch: true,
        showCart: true,
        visible: true,
      });
      // Restore the glass topbar synchronously *before* the page is shown,
      // so coming back from /product-detail with a preserved scroll position
      // doesn't flash a non-glass header for ~300ms while ionViewDidEnter
      // would resolve getScrollElement().
      if (this.cachedScrolled) {
        this.header.setScrolled(true);
      }
    } else {
      this.header.hide();
    }
  }

  ionViewWillLeave(): void {
    if (!this.isNative) return;
    this.cachedScrolled = this.header.scrolled();
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
