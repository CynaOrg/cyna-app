import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { Product } from '@core/interfaces/product.interface';
import { ProductStore } from '@core/stores/product.store';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import { NativeCatalogGridComponent } from '../../components/native-catalog-grid.component';

/**
 * Native list of physical products mounted at `/m/products`.
 */
@Component({
  selector: 'app-products-native',
  standalone: true,
  imports: [
    IonicModule,
    NativePageHeaderComponent,
    NativeCatalogGridComponent,
  ],
  templateUrl: './products-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsNativePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

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

    this.productStore.physicalProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => this.products.set(products));

    this.fetch();
  }

  refresh(event: CustomEvent): void {
    this.fetch(() => {
      const target = event.target as HTMLIonRefresherElement | null;
      target?.complete();
    });
  }

  private fetch(done?: () => void): void {
    this.productStore
      .fetchByType('physical', 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => done?.(),
        error: () => done?.(),
        complete: () => done?.(),
      });
  }
}
