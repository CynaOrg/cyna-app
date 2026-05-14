describe('Dashboard — Orders', () => {
  beforeEach(() => {
    cy.mockAuth();
    cy.mockCart([]);
  });

  it('lists the authenticated user orders', () => {
    cy.intercept('GET', '/api/v1/orders', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'order-1',
            orderNumber: 'CYN-000001',
            status: 'paid',
            total: 1558.8,
            createdAt: '2026-05-01T10:00:00.000Z',
            items: [
              {
                id: 'oi-1',
                productId: 'prod-physical-1',
                unitPrice: 1299,
                quantity: 1,
                billingPeriod: null,
                productSnapshot: { name: 'Firewall Pro X1', image: null },
              },
            ],
          },
          {
            id: 'order-2',
            orderNumber: 'CYN-000002',
            status: 'pending',
            total: 750,
            createdAt: '2026-05-05T10:00:00.000Z',
            items: [
              {
                id: 'oi-2',
                productId: 'prod-license-1',
                unitPrice: 750,
                quantity: 1,
                billingPeriod: null,
                productSnapshot: {
                  name: 'EDR Licence 25 postes',
                  image: null,
                },
              },
            ],
          },
        ],
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('getOrders');

    cy.visit('/dashboard/orders');
    cy.wait('@getOrders');

    cy.contains('CYN-000001').should('be.visible');
    cy.contains('CYN-000002').should('be.visible');
  });

  it('navigates to the order detail page on click', () => {
    cy.intercept('GET', '/api/v1/orders', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'order-1',
            orderNumber: 'CYN-000001',
            status: 'paid',
            total: 1299,
            createdAt: '2026-05-01T10:00:00.000Z',
            items: [
              {
                id: 'oi-1',
                productId: 'prod-physical-1',
                unitPrice: 1299,
                quantity: 1,
                billingPeriod: null,
                productSnapshot: { name: 'Firewall Pro X1', image: null },
              },
            ],
          },
        ],
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('getOrders');

    cy.intercept('GET', '/api/v1/orders/order-1', {
      statusCode: 200,
      body: {
        data: {
          id: 'order-1',
          orderNumber: 'CYN-000001',
          status: 'paid',
          total: 1299,
          createdAt: '2026-05-01T10:00:00.000Z',
          items: [
            {
              id: 'oi-1',
              productId: 'prod-physical-1',
              unitPrice: 1299,
              quantity: 1,
              billingPeriod: null,
              productSnapshot: { name: 'Firewall Pro X1', image: null },
            },
          ],
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('getOrder');

    cy.visit('/dashboard/orders');
    cy.wait('@getOrders');
    // The order card is an <a> with routerLink to /dashboard/orders/:id.
    // Click the anchor, not just the text span inside it.
    cy.get('a[href*="/dashboard/orders/order-1"]').first().click({
      force: true,
    });
    cy.url({ timeout: 10000 }).should('include', '/dashboard/orders/order-1');
  });
});
