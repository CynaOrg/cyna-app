import { test } from '@playwright/test';
import { screenshotPage } from '../helpers/screenshot';

const PUBLIC_PAGES: ReadonlyArray<{ route: string; name: string }> = [
  { route: '/landing', name: 'landing' },
  { route: '/auth/login', name: 'auth-login' },
  { route: '/auth/register', name: 'auth-register' },
  { route: '/products', name: 'products-list' },
  { route: '/services', name: 'services' },
  { route: '/licenses', name: 'licenses' },
  { route: '/contact', name: 'contact' },
  { route: '/cart', name: 'cart' },
  { route: '/checkout', name: 'checkout' },
  { route: '/legal/cgu', name: 'legal-cgu' },
  { route: '/legal/mentions', name: 'legal-mentions' },
  { route: '/legal/privacy', name: 'legal-privacy' },
];

for (const { route, name } of PUBLIC_PAGES) {
  test(`captures ${name} (${route})`, async ({ page }) => {
    await screenshotPage(page, route, name);
  });
}
