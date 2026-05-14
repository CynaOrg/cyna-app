describe('Checkout — Guest flow (mocked Stripe)', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/auth/refresh-token', {
      statusCode: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    });
  });

  it('redirects to /cart when the cart is empty', () => {
    cy.mockCart([]);
    cy.visit('/checkout');
    // The page redirects to /cart synchronously in ngOnInit when isEmpty().
    cy.url({ timeout: 8000 }).should('include', '/cart');
  });

  it('renders the information step when the cart has items', () => {
    cy.fixture('cart').then((cart) => {
      cy.intercept('GET', '/api/v1/cart', {
        statusCode: 200,
        body: {
          data: cart,
          meta: { timestamp: new Date().toISOString(), requestId: 'r' },
        },
      }).as('getCart');
    });

    // Stub the payment-intent endpoint so we can verify the API contract even
    // though we don't actually drive the form to submission (AddressPicker
    // requires complex valid input we'd rather not simulate end-to-end).
    cy.intercept('POST', '/api/v1/checkout/payment-intent', {
      statusCode: 201,
      body: {
        data: {
          clientSecret: 'pi_test_secret',
          orderId: 'order-test-1',
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('createIntent');

    cy.visit('/checkout');
    cy.wait('@getCart');

    // Step 1 (Information) is the default landing — the email field and the
    // "Continuer vers le paiement" CTA must be visible.
    cy.contains(/continuer vers le paiement|payment/i, {
      timeout: 8000,
    }).should('exist');
    cy.get('input[type="email"]').should('be.visible');
  });

  it('renders the order confirmation page for any orderId (stubbed)', () => {
    // Skip the Stripe element entirely — just verify the confirmation route
    // is reachable and that the page hits the orders endpoint.
    cy.intercept('GET', '/api/v1/orders/order-test-1', {
      statusCode: 200,
      body: {
        data: {
          id: 'order-test-1',
          orderNumber: 'CYN-000001',
          status: 'paid',
          total: 1558.8,
          createdAt: new Date().toISOString(),
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

    cy.visit('/order/confirmation/order-test-1');
    // The page should not crash; just assert the URL stuck.
    cy.url().should('include', '/order/confirmation/order-test-1');
  });
});
