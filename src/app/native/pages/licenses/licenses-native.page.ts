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
 * Native list of software licenses mounted at `/m/licenses`.
 */
@Component({
  selector: 'app-licenses-native',
  standalone: true,
  imports: [
    IonicModule,
    NativePageHeaderComponent,
    NativeCatalogGridComponent,
  ],
  templateUrl: './licenses-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicensesNativePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly licenses = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this.isLoading.set(loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this.error.set(error));

    this.productStore.licenseProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => this.licenses.set(products));

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
      .fetchByType('license', 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => done?.(),
        error: () => done?.(),
        complete: () => done?.(),
      });
  }
}
