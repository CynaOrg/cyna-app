import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import type { URLOpenListenerEvent } from '@capacitor/app';
import { AppLifecycleService } from './app-lifecycle.service';

/**
 * Maps `cyna://` URLs received via Capacitor's `appUrlOpen` to Angular
 * routes. Wired once at boot from `AppComponent.ngOnInit()`. Unknown
 * URLs are logged once (best-effort) and ignored — never crash on a
 * malformed deep link.
 *
 * Supported routes:
 * - `cyna://catalog`           → /products
 * - `cyna://product/:slug`     → /products/:slug
 * - `cyna://order/:id`         → /order/confirmation/:id
 * - `cyna://account`           → /dashboard/account
 *
 * Universal links (https://cyna-app.up.railway.app/...) are also handled
 * by trimming the host so `https://cyna-app.up.railway.app/products/x`
 * resolves to `/products/x`. This is a defensive convenience — the
 * primary contract is the `cyna://` scheme.
 */
@Injectable({ providedIn: 'root' })
export class DeepLinkService implements OnDestroy {
  private readonly lifecycle = inject(AppLifecycleService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();
  private initialised = false;

  /** Hostnames that count as "our" web origin for universal link parsing. */
  private static readonly UNIVERSAL_HOSTS = new Set([
    'cyna-app.up.railway.app',
    'cyna.app',
  ]);

  /**
   * Subscribe to `urlOpen$` and route incoming deep links. Idempotent.
   */
  init(): void {
    if (this.initialised) {
      return;
    }
    this.initialised = true;

    this.lifecycle.urlOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: URLOpenListenerEvent) => {
        this.handle(event.url);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Public so tests / future callers can dispatch a URL manually
   * (e.g. when the app is cold-started by the OS with a launch URL).
   * Returns `true` when a route was matched.
   */
  handle(rawUrl: string | undefined | null): boolean {
    if (!rawUrl) return false;
    const target = this.resolve(rawUrl);
    if (!target) return false;
    void this.router.navigate(target);
    return true;
  }

  private resolve(rawUrl: string): unknown[] | null {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return null;
    }

    // `cyna://` puts the first path segment in `host` because the URL
    // parser treats it as an authority. So `cyna://catalog` parses with
    // host = 'catalog' and pathname = ''. We normalise both shapes.
    if (url.protocol === 'cyna:') {
      const segments = [url.host, ...url.pathname.split('/')]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return this.matchSegments(segments);
    }

    // Universal link path: only honour it when it points at our known
    // hosts. Otherwise it's an external URL we shouldn't intercept.
    if (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      DeepLinkService.UNIVERSAL_HOSTS.has(url.host)
    ) {
      const segments = url.pathname.split('/').filter((s) => s.length > 0);
      return this.matchSegments(segments);
    }

    return null;
  }

  private matchSegments(segments: string[]): unknown[] | null {
    if (segments.length === 0) return null;
    const [head, ...rest] = segments;

    switch (head) {
      case 'catalog':
      case 'products':
        if (rest.length === 0) return ['/products'];
        // `cyna://catalog/foo` and `cyna://products/foo` both map to the
        // product detail page.
        return ['/products', rest[0]];

      case 'product':
        if (rest.length === 0) return null;
        return ['/products', rest[0]];

      case 'order':
        if (rest.length === 0) return null;
        return ['/order/confirmation', rest[0]];

      case 'account':
        return ['/dashboard/account'];

      default:
        return null;
    }
  }
}
