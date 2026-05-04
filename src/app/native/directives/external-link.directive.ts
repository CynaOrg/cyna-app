import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { NativePlatformService } from '../services/native-platform.service';

/**
 * Routes external links through the in-app browser on native and falls back
 * to a new tab on the web.
 *
 * Apply on any anchor (or element exposing an `href` attribute) that points
 * to an external URL. The directive intercepts the click, prevents the
 * default navigation (which would replace the WebView on iOS) and instead
 * opens the URL via Capacitor Browser — which presents a SFSafariViewController
 * on iOS / Custom Tab on Android, keeping the user inside the app session.
 *
 * Usage:
 *   `<a appExternalLink href="https://cyna.app/legal">Voir le site</a>`
 */
@Directive({
  selector: '[appExternalLink]',
  standalone: true,
})
export class ExternalLinkDirective {
  private readonly host =
    inject<ElementRef<HTMLAnchorElement | HTMLElement>>(ElementRef);
  private readonly platform = inject(NativePlatformService);

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent): Promise<void> {
    const url = this.resolveHref();
    if (!url) {
      // Nothing to open — let the default behaviour run (likely a no-op).
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.platform.isNative()) {
      try {
        await this.openInAppBrowser(url);
        return;
      } catch {
        /* fall through to the web fallback below */
      }
    }

    this.openInNewTab(url);
  }

  /** Native path. Extracted as an overridable method so tests can stub it. */
  protected openInAppBrowser(url: string): Promise<void> {
    return Browser.open({ url });
  }

  /**
   * Web fallback. `noopener,noreferrer` avoids exposing `window.opener`
   * to the destination.
   */
  protected openInNewTab(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private resolveHref(): string | null {
    const el = this.host.nativeElement as HTMLAnchorElement & HTMLElement;
    const fromAnchor = (el as HTMLAnchorElement).href;
    if (fromAnchor) {
      return fromAnchor;
    }
    return el.getAttribute?.('href') ?? null;
  }
}
