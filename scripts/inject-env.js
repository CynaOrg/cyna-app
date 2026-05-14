#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Inject runtime secrets into src/environments/environment.prod.ts at build
 * time.
 *
 * Required variables in production CI (Railway):
 * - STRIPE_PUBLISHABLE_KEY: Stripe publishable key (pk_live_*) — replaces the
 *   pk_test_ placeholder kept in source for local development.
 *
 * Behaviour:
 * - When STRIPE_PUBLISHABLE_KEY is set, its value is patched into
 *   environment.prod.ts.
 * - When it is unset AND we detect a CI / Railway / NODE_ENV=production
 *   context, the script fails the build to prevent shipping pk_test_ to prod.
 * - Otherwise (local prod build for testing) the script logs a warning and
 *   leaves the file untouched.
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(
  __dirname,
  '..',
  'src',
  'environments',
  'environment.prod.ts',
);

const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY;
const isCi =
  process.env.CI === 'true' ||
  Boolean(process.env.RAILWAY_ENVIRONMENT_NAME) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  process.env.NODE_ENV === 'production';

if (!stripeKey) {
  if (isCi) {
    console.error(
      '[inject-env] STRIPE_PUBLISHABLE_KEY is required for production builds. ' +
        'Set it in Railway variables before deploying.',
    );
    process.exit(1);
  }
  console.warn(
    '[inject-env] STRIPE_PUBLISHABLE_KEY is not set, leaving environment.prod.ts untouched ' +
      '(safe for local builds).',
  );
  process.exit(0);
}

if (!/^pk_(live|test)_/.test(stripeKey)) {
  console.error(
    `[inject-env] STRIPE_PUBLISHABLE_KEY does not look like a Stripe publishable key: ${stripeKey.slice(0, 12)}…`,
  );
  process.exit(1);
}

if (isCi && stripeKey.startsWith('pk_test_')) {
  console.warn(
    '[inject-env] WARNING: deploying a pk_test_ key in a CI/production context. ' +
      'Use pk_live_* for the real production build.',
  );
}

const content = fs.readFileSync(envFile, 'utf8');
const patched = content.replace(
  /(stripePublishableKey:\s*')[^']*(')/m,
  `$1${stripeKey}$2`,
);

if (content === patched) {
  console.error(
    '[inject-env] Could not locate stripePublishableKey assignment in environment.prod.ts. ' +
      'The file format may have changed.',
  );
  process.exit(1);
}

fs.writeFileSync(envFile, patched);
console.log(
  `[inject-env] Stripe publishable key injected (${stripeKey.slice(0, 12)}…).`,
);
