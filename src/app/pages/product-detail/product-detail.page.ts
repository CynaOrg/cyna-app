import {
  Component,
  computed,
  signal,
  OnInit,
  DestroyRef,
  inject,
  ViewChild,
  ElementRef,
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
  styles: [
    `
      :host ::ng-deep .gallery-scroll::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
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

  selectedIndex = signal(0);

  selectedImage = computed(() => {
    const images = this.sortedImages();
    if (!images.length) {
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
    }
    return images[this.selectedIndex()] ?? images[0];
  });

  @ViewChild('carouselContainer')
  carouselContainer!: ElementRef<HTMLDivElement>;

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
    this.cartStore.addItem(p.id, this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => {
      this.addedToCart.set(false);
      this.quantity.set(1);
    }, 1500);
  }

  selectImage(index: number): void {
    const images = this.sortedImages();
    if (index < 0 || index >= images.length) return;
    this.selectedIndex.set(index);
    this.scrollCarouselTo(index);
  }

  nextImage(): void {
    const images = this.sortedImages();
    if (!images.length) return;
    const next = (this.selectedIndex() + 1) % images.length;
    this.selectImage(next);
  }

  prevImage(): void {
    const images = this.sortedImages();
    if (!images.length) return;
    const prev = (this.selectedIndex() - 1 + images.length) % images.length;
    this.selectImage(prev);
  }

  onCarouselScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const index = Math.round(scrollLeft / itemWidth);
    if (
      index !== this.selectedIndex() &&
      index >= 0 &&
      index < this.sortedImages().length
    ) {
      this.selectedIndex.set(index);
    }
  }

  private scrollCarouselTo(index: number): void {
    const container = this.carouselContainer?.nativeElement;
    if (!container) return;
    const itemWidth = container.offsetWidth;
    container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
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
