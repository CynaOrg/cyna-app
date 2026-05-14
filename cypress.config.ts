import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // 4201 is used locally to avoid conflict with cyna-backoffice which often
    // squats 4200. CI builds the app and serves it on 4200 (see ci.yml), so
    // override with CYPRESS_baseUrl=http://localhost:4200 when running in CI.
    baseUrl: process.env['CYPRESS_BASE_URL'] || 'http://localhost:4201',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
