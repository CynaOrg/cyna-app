import { Component, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Product, ProductImage } from '@core/interfaces/product.interface';
import { MOCK_SERVICES, MOCK_PRODUCTS } from '@core/mocks/products.mock';

@Component({
  standalone: false,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage implements OnInit {
  product = signal<Product | null>(null);
  similarProducts = signal<Product[]>([]);

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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const allProducts = [...MOCK_SERVICES, ...MOCK_PRODUCTS];
    const found = allProducts.find((p) => p.slug === slug) ?? null;
    this.product.set(found);

    if (found) {
      this.similarProducts.set(
        allProducts.filter(
          (p) => p.productType === found.productType && p.id !== found.id,
        ),
      );
    }
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
