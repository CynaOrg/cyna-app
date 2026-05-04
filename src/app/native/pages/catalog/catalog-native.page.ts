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
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowRight,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorStorefront,
  phosphorKey,
} from '@ng-icons/phosphor-icons/regular';
import { Product } from '@core/interfaces/product.interface';
import { ProductStore } from '@core/stores/product.store';
import { NativeProductListComponent } from '../../components/native-product-list.component';

interface HubCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  cta: string;
  gradient: string;
}

/**
 * Catalog hub page (`/m/catalog`).
 *
 * Three large cards routing to Services, Produits and Licences, plus a
 * "Populaires" carousel pulled from the product store. Inspired by the
 * cadrage spec (page 38).
 */
@Component({
  selector: 'app-catalog-native',
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    NgIconComponent,
    NativeProductListComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowRight,
      phosphorPackage,
      phosphorShieldCheck,
      phosphorStorefront,
      phosphorKey,
    }),
  ],
  templateUrl: './catalog-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogNativePage implements OnInit {
  private readonly productStore = inject(ProductStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly featured = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly cards: HubCard[] = [
    {
      title: 'Services',
      description: 'SOC, EDR, XDR, audits et consulting par nos experts.',
      icon: 'phosphorShieldCheck',
      route: '/m/services',
      cta: 'Voir les services',
      gradient: 'linear-gradient(135deg, #4f39f6 0%, #7355ff 100%)',
    },
    {
      title: 'Produits',
      description: 'Hardware, équipements réseau et accessoires.',
      icon: 'phosphorStorefront',
      route: '/m/products',
      cta: 'Voir les produits',
      gradient: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)',
    },
    {
      title: 'Licences',
      description: 'Antivirus, certificats et licences logicielles.',
      icon: 'phosphorKey',
      route: '/m/licenses',
      cta: 'Voir les licences',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    },
  ];

  ngOnInit(): void {
    this.productStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this.isLoading.set(loading));

    this.productStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this.error.set(error));

    this.productStore.featured$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => this.featured.set(products));

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
      .fetchProducts({ limit: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => done?.(),
        error: () => done?.(),
        complete: () => done?.(),
      });
  }
}
