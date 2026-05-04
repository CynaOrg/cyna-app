import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorMinus,
  phosphorPlus,
  phosphorShareNetwork,
  phosphorShoppingCart,
} from '@ng-icons/phosphor-icons/regular';
import { EMPTY, filter, switchMap, tap } from 'rxjs';
import { Product, ProductImage } from '@core/interfaces/product.interface';
import { ProductStore } from '@core/stores/product.store';
import { CartStore } from '@core/stores/cart.store';
import { ShareService } from '../../services/share.service';
import { NativeProductCardComponent } from '../../components/native-product-card.component';

/**
 * Native product detail page mounted at `/m/products/:slug`,
 * `/m/services/:slug`, `/m/licenses/:slug`.
 *
 * Mirrors the storefront `ProductDetailPage` (mobile branch) but the back
 * and share controls go through the native services (`Location.back()` +
 * `ShareService` which prefers the Capacitor Share plugin).
 */
@Component({
  selector: 'app-product-detail-native',
  standalone: true,
  imports: [
    IonicModule,
    TranslateModule,
    NgIconComponent,
    RouterLink,
    NativeProductCardComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowLeft,
      phosphorMinus,
      phosphorPlus,
      phosphorShareNetwork,
      phosphorShoppingCart,
    }),
  ],
  templateUrl: './product-detail-native.page.html',
  styles: [
    `
      :host ::ng-deep .gallery-scroll::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailNativePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly productStore = inject(ProductStore);
  private readonly cartStore = inject(CartStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly shareService = inject(ShareService);

  readonly product = signal<Product | null>(null);
  readonly similarProducts = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly addedToCart = signal(false);
  readonly quantity = signal(1);
  readonly selectedIndex = signal(0);

  readonly isSaas = computed(() => this.product()?.productType === 'saas');

  readonly sortedImages = computed<ProductImage[]>(() => {
    const p = this.product();
    if (!p?.images?.length) return [];
    return [...p.images].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  readonly selectedImage = computed<ProductImage | null>(() => {
    const images = this.sortedImages();
    if (!images.length) {
      const p = this.product();
      if (p?.primaryImageUrl) {
        return {
          id: 'fallback',
          imageUrl: p.primaryImageUrl,
          displayOrder: 0,
          isPrimary: true,
        };
      }
      return null;
    }
    return images[this.selectedIndex()] ?? images[0];
  });

  readonly similarRoutePrefix = computed(() => {
    const url = this.router.url;
    const match = url.match(/^(\/m\/[^/]+)/);
    return match ? match[1] : '/m/products';
  });

  @ViewChild('carouselContainer')
  carouselContainer?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const slug = params.get('slug');
        if (slug) {
          this.loadProduct(slug);
        }
      });
  }

  private loadProduct(slug: string): void {
    this.isLoading.set(true);
    this.product.set(null);
    this.selectedIndex.set(0);
    this.quantity.set(1);
    this.addedToCart.set(false);

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
          if (!product) return EMPTY;
          return this.productStore.fetchSimilarProducts(
            product.productType,
            product.slug,
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((similar) => this.similarProducts.set(similar));
  }

  goBack(): void {
    this.location.back();
  }

  async share(): Promise<void> {
    const p = this.product();
    if (!p) return;
    const url =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : `https://cyna.io/m/products/${p.slug}`;
    await this.shareService.share({
      title: p.name,
      text: p.shortDescription ?? '',
      url,
      dialogTitle: p.name,
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

  subscribeToProduct(): void {
    const p = this.product();
    if (!p) return;
    this.router.navigate(['/m/subscribe', p.slug]);
  }

  selectImage(index: number): void {
    const images = this.sortedImages();
    if (index < 0 || index >= images.length) return;
    this.selectedIndex.set(index);
    const container = this.carouselContainer?.nativeElement;
    if (container) {
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth',
      });
    }
  }

  onCarouselScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const itemWidth = container.offsetWidth;
    if (itemWidth === 0) return;
    const index = Math.round(container.scrollLeft / itemWidth);
    if (
      index !== this.selectedIndex() &&
      index >= 0 &&
      index < this.sortedImages().length
    ) {
      this.selectedIndex.set(index);
    }
  }
}
