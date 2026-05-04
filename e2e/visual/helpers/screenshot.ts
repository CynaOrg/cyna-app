import { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const SCREENSHOT_ROOT = '../../docs/audits/screenshots/playwright';

export interface ScreenshotOptions {
  fullPage?: boolean;
  waitForSelector?: string;
  waitMs?: number;
}

export async function screenshotPage(
  page: Page,
  route: string,
  name: string,
  opts: ScreenshotOptions = {},
): Promise<string> {
  await page.goto(route, { waitUntil: 'networkidle' });
  if (opts.waitForSelector) {
    await page.waitForSelector(opts.waitForSelector, { timeout: 5000 });
  }
  if (opts.waitMs) {
    await page.waitForTimeout(opts.waitMs);
  }
  const viewport = page.viewportSize();
  const tag = viewport ? `${viewport.width}x${viewport.height}` : 'unknown';
  const filename = `${name}-${tag}.png`;
  const fullPath = join(__dirname, '..', SCREENSHOT_ROOT, filename);
  await mkdir(dirname(fullPath), { recursive: true });
  await page.screenshot({ path: fullPath, fullPage: opts.fullPage ?? true });
  return fullPath;
}
