import {
  Component,
  computed,
  signal,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap, filter, tap, EMPTY } from 'rxjs';
import { Product, ProductImage } from '@core/interfaces/product.interface';
import { ProductStore } from '@core/stores/product.store';
import { CartStore } from '@core/stores/cart.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  standalone: false,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);
  private readonly destroyRef = inject(DestroyRef);

  isNative = isNativeCapacitor();

  product = signal<Product | null>(null);
  similarProducts = signal<Product[]>([]);
  isLoading = signal(false);

  addedToCart = signal(false);
  quantity = signal(1);

  isSaas = computed(() => this.product()?.productType === 'saas');

  ctaLabel = computed(() =>
    this.isSaas() ? "S'abonner" : 'Ajouter au panier',
  );

  priceDisplay = computed(() => {
    const p = this.product();
    if (!p) return '';
    if (p.priceMonthly) return `${p.priceMonthly}\u20AC`;
    if (p.priceUnit) return `${p.priceUnit}\u20AC`;
    return 'Sur devis';
  });

  priceSuffix = computed(() => {
    const p = this.product();
    if (!p) return '';
    if (p.priceMonthly) return '/mois';
    return '';
  });

  sortedImages = computed(() => {
    const p = this.product();
    if (!p?.images?.length) return [];
    return [...p.images].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  mainImage = computed(() => {
    const images = this.sortedImages();
    if (images.length) {
      const primary = images.find((img) => img.isPrimary);
      return primary ?? images[0];
    }
    const p = this.product();
    if (p?.primaryImageUrl) {
      return {
        id: 'fallback',
        imageUrl: p.primaryImageUrl,
        displayOrder: 0,
        isPrimary: true,
      } as ProductImage;
    }
    return null;
  });

  secondImage = computed(() => {
    const images = this.sortedImages();
    const main = this.mainImage();
    if (!main || images.length < 2) return null;
    return images.find((img) => img.id !== main.id) ?? null;
  });

  thirdImage = computed(() => {
    const images = this.sortedImages();
    const main = this.mainImage();
    const second = this.secondImage();
    if (!main || !second || images.length < 3) return null;
    return (
      images.find((img) => img.id !== main.id && img.id !== second.id) ?? null
    );
  });

  remainingImagesCount = computed(() => {
    const images = this.sortedImages();
    return Math.max(0, images.length - 2);
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.isLoading.set(true);

    this.productStore
      .fetchProductBySlug(slug)
      .pipe(
        tap((product) => {
          if (!product) {
            this.isLoading.set(false);
          }
        }),
        filter((product) => !!product),
        switchMap((product) => {
          this.product.set(product);
          this.isLoading.set(false);
          return this.productStore.fetchSimilarProducts(
            product.productType,
            product.slug,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((similar) => {
        this.similarProducts.set(similar);
      });
  }

  incrementQty(): void {
    this.quantity.update((q) => Math.min(q + 1, 99));
  }

  decrementQty(): void {
    this.quantity.update((q) => Math.max(q - 1, 1));
  }

  onQuantityInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      this.quantity.set(1);
    } else {
      this.quantity.set(Math.min(parsed, 99));
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p || this.isSaas()) return;
    this.cartStore.addItem(p, this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => {
      this.addedToCart.set(false);
      this.quantity.set(1);
    }, 1500);
  }

  goBack(): void {
    this.location.back();
  }

  share(): void {
    const p = this.product();
    if (!p) return;
    if (navigator.share) {
      navigator.share({
        title: p.name,
        text: p.shortDescription ?? '',
        url: window.location.href,
      });
    }
  }
}
