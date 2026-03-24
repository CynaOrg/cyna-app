import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { Product } from '@core/interfaces/product.interface';
import { FaqTab } from '@shared/components/faq/faq.component';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  standalone: false,
})
export class LandingPage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  allProducts: Product[] = [];
  isLoading = false;
  error: string | null = null;

  faqTabs: FaqTab[] = [
    {
      label: 'FAQ.TABS.GENERAL',
      items: [
        { question: 'FAQ.GENERAL.Q1', answer: 'FAQ.GENERAL.A1' },
        { question: 'FAQ.GENERAL.Q2', answer: 'FAQ.GENERAL.A2' },
        { question: 'FAQ.GENERAL.Q3', answer: 'FAQ.GENERAL.A3' },
      ],
    },
    {
      label: 'FAQ.TABS.PRODUCTS',
      items: [
        { question: 'FAQ.PRODUCTS.Q1', answer: 'FAQ.PRODUCTS.A1' },
        { question: 'FAQ.PRODUCTS.Q2', answer: 'FAQ.PRODUCTS.A2' },
        { question: 'FAQ.PRODUCTS.Q3', answer: 'FAQ.PRODUCTS.A3' },
      ],
    },
    {
      label: 'FAQ.TABS.SERVICES',
      items: [
        { question: 'FAQ.SERVICES.Q1', answer: 'FAQ.SERVICES.A1' },
        { question: 'FAQ.SERVICES.Q2', answer: 'FAQ.SERVICES.A2' },
        { question: 'FAQ.SERVICES.Q3', answer: 'FAQ.SERVICES.A3' },
      ],
    },
    {
      label: 'FAQ.TABS.SECURITY',
      items: [
        { question: 'FAQ.SECURITY.Q1', answer: 'FAQ.SECURITY.A1' },
        { question: 'FAQ.SECURITY.Q2', answer: 'FAQ.SECURITY.A2' },
        { question: 'FAQ.SECURITY.Q3', answer: 'FAQ.SECURITY.A3' },
      ],
    },
  ];

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.isLoading = loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.error = error));

    this.productStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.allProducts = products.filter((p) => p.isFeatured).slice(0, 8);
        if (this.allProducts.length === 0) {
          this.allProducts = products.slice(0, 8);
        }
      });

    this.loadProducts();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadProducts());
  }

  private loadProducts(): void {
    this.productStore
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
