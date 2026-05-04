import {
  Directive,
  HostListener,
  Input,
  InjectionToken,
  inject,
} from '@angular/core';
import { Browser as CapacitorBrowser } from '@capacitor/browser';
import { NativePlatformService } from '@core/native';

/**
 * Injection token for the `@capacitor/browser` plugin. Tests can override
 * via `{ provide: BROWSER_PLUGIN, useValue: mock }`.
 */
export const BROWSER_PLUGIN = new InjectionToken<typeof CapacitorBrowser>(
  'BROWSER_PLUGIN',
  { providedIn: 'root', factory: () => CapacitorBrowser },
);

/**
 * Opens external links via `@capacitor/browser` on native (so the user
 * stays inside the app via the SFSafariViewController / Custom Tabs
 * sheet) and falls back to a regular new-tab navigation on web.
 *
 * Apply on any anchor with an absolute URL — the directive intercepts
 * the click and routes it through Capacitor's in-app browser:
 *
 * ```html
 * <a appExternalLink href="https://stripe.com/legal">Stripe legal</a>
 * ```
 *
 * Also works with explicit URL bindings:
 *
 * ```html
 * <button [appExternalLink]="'https://cnil.fr'">CNIL</button>
 * ```
 */
@Directive({
  selector: '[appExternalLink]',
  standalone: true,
})
export class ExternalLinkDirective {
  private readonly platform = inject(NativePlatformService);
  private readonly browser = inject(BROWSER_PLUGIN);

  /**
   * Optional override URL. When omitted, the directive reads `href` from
   * the host element (anchor tag), which is the natural usage.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('appExternalLink') href: string | '' = '';

  @HostListener('click', ['$event'])
  protected async onClick(event: Event): Promise<void> {
    const url = this.resolveUrl(event);
    if (!url) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.platform.isNative()) {
      try {
        await this.browser.open({ url });
        return;
      } catch {
        // Plugin missing in dev — fall through to web behaviour so the
        // link still goes somewhere.
      }
    }
    // Web fallback: open in a new tab.
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private resolveUrl(event: Event): string | null {
    if (this.href) return this.href;
    const target = event.currentTarget as HTMLAnchorElement | null;
    if (target?.href) return target.href;
    return null;
  }
}
