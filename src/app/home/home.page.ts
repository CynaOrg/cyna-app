import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonContent } from '@ionic/angular';
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

  @ViewChild(IonContent) ionContent?: IonContent;

  isNative = isNativeCapacitor();
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
    } else {
      this.header.hide();
    }
  }

  /**
   * After Ionic restores the page from its router cache (e.g. coming back
   * from /product-detail), the scroll position is preserved but the shared
   * `header.scrolled` signal was reset to false in `configure()`. Read the
   * actual scrollTop and re-sync so the glass topbar matches the position.
   */
  async ionViewDidEnter(): Promise<void> {
    if (!this.isNative || !this.ionContent) return;
    const el = await this.ionContent.getScrollElement();
    this.header.setScrolled(el.scrollTop > 50);
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
