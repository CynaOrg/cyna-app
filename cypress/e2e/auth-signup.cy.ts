describe('Auth — Sign up', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/v1/auth/refresh-token', {
      statusCode: 401,
      body: { error: { code: 'UNAUTHORIZED' } },
    });
  });

  it('renders the registration form with all required fields', () => {
    cy.visit('/auth/register');
    cy.contains('h1', 'Inscrivez-vous').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('have.length.at.least', 2);
    cy.get('button[type="submit"]').should('contain.text', "S'inscrire");
  });

  it('submits a valid registration and routes to the email-sent page', () => {
    cy.intercept('POST', '/api/v1/auth/register', {
      statusCode: 201,
      body: {
        data: {
          id: 'u-new',
          email: 'newuser@cyna.local',
          message: 'Vérifiez votre email',
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('register');

    cy.visit('/auth/register');
    // Fill first/last name (first two text inputs)
    cy.get('input[autocomplete="given-name"]').type('Alice');
    cy.get('input[autocomplete="family-name"]').type('Martin');
    cy.get('input[type="email"]').type('newuser@cyna.local');
    // Strong password: matches /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
    cy.get('input[autocomplete="new-password"]').first().type('Strong1!');
    cy.get('input[autocomplete="new-password"]').last().type('Strong1!');

    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@register');

    // After register, app navigates to /auth/email-sent with a friendly message
    cy.url().should('include', '/auth/email-sent');
  });

  it('keeps the submit button disabled when the password is too weak', () => {
    cy.visit('/auth/register');
    cy.get('input[autocomplete="given-name"]').type('Alice');
    cy.get('input[autocomplete="family-name"]').type('Martin');
    cy.get('input[type="email"]').type('weak@cyna.local');
    cy.get('input[autocomplete="new-password"]').first().type('weakpass');
    cy.get('input[autocomplete="new-password"]').last().type('weakpass');
    // The form is invalid → submit stays disabled (form.invalid drives it).
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
