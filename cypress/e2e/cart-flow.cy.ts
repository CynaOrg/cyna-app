describe('Cart — Add, update, remove', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/auth/refresh-token', {
      statusCode: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    });
  });

  it('shows the empty state when the cart has no items', () => {
    cy.mockCart([]);
    cy.visit('/cart');
    cy.wait('@getCart');
    cy.contains(/panier|cart/i).should('exist');
    // Empty state CTA points to landing/home/dashboard products
    cy.contains(/découvrir|catalog|produits/i, { timeout: 8000 }).should(
      'be.visible',
    );
  });

  it('renders cart items, updates quantity, and removes an item', () => {
    cy.fixture('cart').then((cart) => {
      // First load: 1 item in cart
      cy.intercept('GET', '/api/v1/cart', {
        statusCode: 200,
        body: {
          data: cart,
          meta: { timestamp: new Date().toISOString(), requestId: 'r' },
        },
      }).as('getCartFull');

      // Update quantity (PATCH /api/v1/cart/items/:productId) → return cart
      // with quantity = 2.
      const cartQty2 = {
        ...cart,
        items: [{ ...cart.items[0], quantity: 2 }],
        itemCount: 2,
      };
      cy.intercept('PATCH', '/api/v1/cart/items/*', {
        statusCode: 200,
        body: {
          data: cartQty2,
          meta: { timestamp: new Date().toISOString(), requestId: 'r' },
        },
      }).as('updateQty');

      // Remove item → empty cart
      const emptyCart = { ...cart, items: [], itemCount: 0 };
      cy.intercept('DELETE', '/api/v1/cart/items/*', {
        statusCode: 200,
        body: {
          data: emptyCart,
          meta: { timestamp: new Date().toISOString(), requestId: 'r' },
        },
      }).as('removeItem');

      cy.visit('/cart');
      cy.wait('@getCartFull');

      // Item details are visible
      cy.contains('Firewall Pro X1').should('be.visible');

      // Click the "+" button to increment quantity
      cy.get(
        'button [name="phosphorPlus"], button ng-icon[name="phosphorPlus"]',
      )
        .first()
        .closest('button')
        .click({ force: true });
      cy.wait('@updateQty');

      // Click the trash/remove button (last small round button in the row)
      cy.get(
        'button [name="phosphorTrash"], button ng-icon[name="phosphorTrash"]',
      )
        .first()
        .closest('button')
        .click({ force: true });
      cy.wait('@removeItem');
    });
  });
});
