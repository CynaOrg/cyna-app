// Cypress support file. Loaded before every spec by config option `supportFile`.
import './commands';

// Hard-reset client state so each test starts from a clean slate. cyna-app no
// longer stores tokens in localStorage (CRIT-3), but we still purge it as a
// safety net in case a regression sneaks one back in.
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  try {
    window.sessionStorage.clear();
  } catch {
    // sessionStorage may not be accessible in cross-origin frames; ignore.
  }

  // Pin language to French so assertions on translated text are deterministic.
  // Without this, ngx-translate falls back to `getBrowserLang()` which returns
  // `en` in CI headless Chrome and breaks every spec that checks FR strings.
  cy.setCookie('cyna_lang', 'fr');

  // Safety-net intercept: any /api/v1/** request the spec did not explicitly
  // stub returns an empty 200 envelope instead of falling through to the
  // dev-server proxy (which would 401 against the real backend and trigger
  // the auth interceptor's refresh → clearSession → /auth/login cycle).
  //
  // Specs can still override with their own cy.intercept() — the LAST
  // matching intercept wins.
  cy.intercept({ url: '/api/v1/**' }, (req) => {
    // Default: respond with an empty data envelope so the app code that
    // unwraps `.data` doesn't crash.
    req.reply({
      statusCode: 200,
      body: {
        data: [],
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'cypress-default',
        },
      },
    });
  });
});

// Swallow uncaught application errors that originate from third-party scripts
// (Stripe.js, browser extensions) or from late-resolving observables when the
// test navigates away — these are not under our control and routinely fail
// runs in CI even when the assertions pass.
Cypress.on('uncaught:exception', (err) => {
  const msg = String(err?.message || '');
  if (
    msg.includes('ResizeObserver') ||
    msg.includes('stripe') ||
    msg.includes('Non-Error promise rejection') ||
    msg.includes('NG0911')
  ) {
    return false;
  }
  // Let other errors fail the test so we surface real bugs.
  return undefined;
});
