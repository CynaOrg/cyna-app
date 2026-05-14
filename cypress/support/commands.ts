/// <reference types="cypress" />

// Custom Cypress commands for cyna-app e2e tests. All commands assume HTTP
// requests are intercepted by `cy.intercept()` — no live backend is required.

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Stub /api/v1/auth/me + /auth/refresh-token so the app appears signed-in. */
      mockAuth(user?: Partial<MockUser>): Chainable<void>;
      /** Stub /api/v1/cart to return the provided items (or an empty cart). */
      mockCart(items?: MockCartItem[]): Chainable<void>;
      /** Stub /api/v1/catalog/products* to return a fixed catalog. */
      mockProducts(): Chainable<void>;
      /** Programmatic login: stubs auth refresh + the login POST, then submits. */
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  preferredLanguage: 'fr' | 'en';
  emailVerified: boolean;
}

export interface MockCartItem {
  id: string;
  productId: string;
  quantity: number;
  billingPeriod: string;
  product: {
    nameFr: string;
    nameEn: string;
    slug: string;
    productType: string;
    priceMonthly: number | null;
    priceYearly: number | null;
    priceUnit: number | null;
    isAvailable: boolean;
    stockQuantity: number | null;
    images: Array<{
      id: string;
      imageUrl: string;
      displayOrder: number;
      isPrimary: boolean;
    }>;
  } | null;
}

const defaultUser: MockUser = {
  id: 'user-1',
  email: 'tom@cyna.local',
  firstName: 'Tom',
  lastName: 'Ynou',
  role: 'customer',
  preferredLanguage: 'fr',
  emailVerified: true,
};

Cypress.Commands.add('mockAuth', (user: Partial<MockUser> = {}) => {
  const u = { ...defaultUser, ...user };
  // tryRestoreSession() hits /auth/refresh-token; returning a fresh access
  // token + user payload makes the app appear authenticated on next render.
  cy.intercept('POST', '/api/v1/auth/refresh-token', {
    statusCode: 200,
    body: {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: u,
      },
      meta: { timestamp: new Date().toISOString(), requestId: 'mock-req' },
    },
  }).as('refreshToken');

  cy.intercept('GET', '/api/v1/profile', {
    statusCode: 200,
    body: {
      data: u,
      meta: { timestamp: new Date().toISOString(), requestId: 'mock-req' },
    },
  }).as('getProfile');
});

Cypress.Commands.add('mockCart', (items: MockCartItem[] = []) => {
  const cart = {
    id: 'cart-1',
    userId: null,
    sessionId: 'session-1',
    items,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cy.intercept('GET', '/api/v1/cart', {
    statusCode: 200,
    body: {
      data: cart,
      meta: { timestamp: new Date().toISOString(), requestId: 'mock-req' },
    },
  }).as('getCart');
});

Cypress.Commands.add('mockProducts', () => {
  cy.fixture('products').then((products) => {
    cy.intercept('GET', '/api/v1/catalog/products*', {
      statusCode: 200,
      body: {
        data: products,
        meta: { total: products.length, page: 1, limit: 20, totalPages: 1 },
      },
    }).as('getProducts');

    products.forEach((p: { slug: string }) => {
      cy.intercept('GET', `/api/v1/catalog/products/${p.slug}*`, {
        statusCode: 200,
        body: {
          data: {
            ...products.find((x: { slug: string }) => x.slug === p.slug),
            description:
              'Solution de cybersécurité de niveau entreprise pour les PME et grands comptes.',
            characteristics: [
              { key: 'Garantie', value: '2 ans' },
              { key: 'Support', value: '24/7' },
            ],
          },
          meta: { timestamp: new Date().toISOString(), requestId: 'mock-req' },
        },
      }).as(`getProduct_${p.slug}`);
    });
  });
});

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.mockAuth({ email });
  cy.intercept('POST', '/api/v1/auth/login', {
    statusCode: 200,
    body: {
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { ...defaultUser, email },
      },
      meta: { timestamp: new Date().toISOString(), requestId: 'mock-req' },
    },
  }).as('login');

  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@login');
});

// Required so this file is treated as a module (avoids TS isolatedModules warnings).
export {};
