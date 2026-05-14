describe('Auth — Login', () => {
  beforeEach(() => {
    // tryRestoreSession() fires on app load via authGuard; make sure it never
    // accidentally signs us in during a "logged out" test.
    cy.intercept('POST', '/api/v1/auth/refresh-token', {
      statusCode: 401,
      body: {
        error: { code: 'UNAUTHORIZED', message: 'No refresh token' },
      },
    }).as('refreshFail');
  });

  it('renders the login form with email and password fields', () => {
    cy.visit('/auth/login');
    cy.contains('h1', 'Connectez-vous').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain.text', 'Se connecter');
  });

  it('signs in with valid credentials and navigates to the dashboard', () => {
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        data: {
          accessToken: 'tok-123',
          refreshToken: 'ref-123',
          user: {
            id: 'u-1',
            email: 'tom@cyna.local',
            firstName: 'Tom',
            lastName: 'Ynou',
            role: 'customer',
            preferredLanguage: 'fr',
            emailVerified: true,
          },
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'r' },
      },
    }).as('login');

    cy.visit('/auth/login');
    cy.get('input[type="email"]').type('tom@cyna.local');
    cy.get('input[type="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    // Allow the auth store to settle and the router to evaluate the
    // dashboard guard. The guard reads isAuthenticated$ off a BehaviorSubject
    // we just hydrated, so the navigation is effectively synchronous, but
    // angular lazy-loading needs a tick to load the dashboard chunk.
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });

  it('shows a French error message on invalid credentials', () => {
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 401,
      body: {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Identifiants invalides',
        },
      },
    }).as('loginFail');

    cy.visit('/auth/login');
    cy.get('input[type="email"]').type('wrong@cyna.local');
    cy.get('input[type="password"]').type('badpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('Identifiants invalides').should('be.visible');
    cy.url().should('include', '/auth/login');
  });
});
