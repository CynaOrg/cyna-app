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
 * Native list of SaaS services mounted at `/m/services`.
 */
@Component({
  selector: 'app-services-native',
  standalone: true,
  imports: [
    IonicModule,
    NativePageHeaderComponent,
    NativeCatalogGridComponent,
  ],
  templateUrl: './services-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesNativePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<Product[]>([]);
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
      .fetchByType('saas', 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => done?.(),
        error: () => done?.(),
        complete: () => done?.(),
      });
  }
}
