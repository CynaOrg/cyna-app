import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AppLifecycleService } from './app-lifecycle.service';
import { NativePlatformService } from './native-platform.service';

/**
 * Translates `cyna://...` deep links into in-app `/m/*` navigations.
 *
 * Mapping (kept close to the URL surface so reviewers can scan it):
 *   cyna://catalog            → /m/catalog
 *   cyna://product/:slug      → /m/products/:slug
 *   cyna://order/:id          → /m/dashboard/orders/:id
 *   cyna://account            → /m/dashboard/account
 *
 * Anything we don't recognise is intentionally ignored — better than
 * sending the user to a confusing 404.
 */
@Injectable({ providedIn: 'root' })
export class DeepLinkService {
  private readonly platform = inject(NativePlatformService);
  private readonly lifecycle = inject(AppLifecycleService);
  private readonly router = inject(Router);
  // takeUntilDestroyed() needs the injection context captured eagerly so
  // init() can be called outside of a constructor.
  private readonly destroyRef = inject(DestroyRef);

  private initialised = false;

  async init(): Promise<void> {
    if (this.initialised) {
      return;
    }
    this.initialised = true;

    if (!this.platform.isNative()) {
      return;
    }

    await this.lifecycle.init();

    this.lifecycle.urlOpen$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const target = this.resolve(event.url);
        if (target) {
          void this.router.navigateByUrl(target);
        }
      });
  }

  /**
   * Pure URL → in-app path resolver. Exposed (rather than inlined) so unit
   * tests can exercise the table without spinning up the lifecycle pipeline.
   */
  resolve(rawUrl: string): string | null {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return null;
    }

    if (parsed.protocol !== 'cyna:') {
      return null;
    }

    // URL parses `cyna://catalog` as host=catalog, pathname=''. We normalise
    // by joining host + pathname into a clean segment list.
    const segments = [
      parsed.hostname,
      ...parsed.pathname.split('/').filter(Boolean),
    ].filter(Boolean);

    if (segments.length === 0) {
      return null;
    }

    const [root, ...rest] = segments;

    switch (root) {
      case 'catalog':
        return '/m/catalog';
      case 'product':
        return rest[0] ? `/m/products/${rest[0]}` : null;
      case 'order':
        return rest[0] ? `/m/dashboard/orders/${rest[0]}` : null;
      case 'account':
        return '/m/dashboard/account';
      default:
        return null;
    }
  }
}
