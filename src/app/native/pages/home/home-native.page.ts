import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorShieldCheck } from '@ng-icons/phosphor-icons/regular';
import { Product } from '@core/interfaces/product.interface';
import { ProductStore } from '@core/stores/product.store';
import { NativeProductListComponent } from '../../components/native-product-list.component';

/**
 * Native home page mounted at `/m/home`.
 *
 * Mirrors the mobile slice of the storefront `HomePage` (see
 * `src/app/home/home.page.html`, the `@if (isNative)` branch) but lives
 * entirely under `src/app/native/` so it can never bleed into the web
 * bundle. Pulls top services and top products as horizontal carousels.
 */
@Component({
  selector: 'app-home-native',
  standalone: true,
  imports: [IonicModule, NgIconComponent, NativeProductListComponent],
  viewProviders: [provideIcons({ phosphorShieldCheck })],
  templateUrl: './home-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNativePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly services = signal<Product[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this.isLoading.set(loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this.error.set(error));

    this.productStore.saasProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => this.services.set(products));

    this.productStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) =>
        this.products.set(products.filter((p) => p.productType !== 'saas')),
      );

    this.fetch();
  }

  refresh(event: CustomEvent): void {
    this.fetch(() => {
      const target = event.target as HTMLIonRefresherElement | null;
      target?.complete();
    });
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/m/catalog');
  }

  private fetch(done?: () => void): void {
    this.productStore
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => done?.(),
        error: () => done?.(),
        complete: () => done?.(),
      });
  }
}
