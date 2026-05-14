describe('Catalog — Browse products', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/auth/refresh-token', {
      statusCode: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    });
    cy.mockCart([]);
    cy.mockProducts();
  });

  it('lists products on /products with at least one card', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    // The catalog renders one <app-product-card> per result, all anchored to
    // /products/{slug}. Assert >= 1 card showed up.
    cy.get('app-product-card', { timeout: 10000 })
      .should('have.length.at.least', 1)
      .first()
      .within(() => {
        cy.get('a').should('have.attr', 'href').and('include', '/products/');
      });
  });

  it('navigates to the product detail page on card click', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    cy.get('app-product-card a').first().click({ force: true });
    cy.url().should('match', /\/products\/[a-z0-9-]+$/);

    // After navigation, scope assertions to the detail page component so we
    // don't accidentally match elements that still belong to the (now
    // ion-page-hidden) catalog page during the Ionic page transition.
    cy.get('app-product-detail', { timeout: 10000 }).should('exist');
    cy.get('app-product-detail').within(() => {
      cy.contains(/Ajouter au panier|S'abonner/, { timeout: 10000 }).should(
        'exist',
      );
    });
  });
});
