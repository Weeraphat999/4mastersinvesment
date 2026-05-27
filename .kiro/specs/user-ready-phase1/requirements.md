# Requirements Document

## Introduction

User-Ready Phase 1 transforms the existing single-user investment analysis app into a multi-user platform. This phase introduces email/password authentication via Supabase Auth, migrates portfolio holdings and decision journal data to Supabase database (per-user), secures API keys behind authenticated Vercel serverless functions, adds a public landing page, and displays a legal disclaimer. Existing app pages become accessible only to authenticated users.

## Glossary

- **App**: The Four Masters Investor web application built with Vite, React 18, TypeScript, Tailwind CSS, and react-router-dom v7
- **Auth_Service**: Supabase Authentication service handling email/password sign-up, sign-in, and session management
- **Database**: Supabase PostgreSQL database storing per-user portfolio holdings and decision journal entries
- **API_Proxy**: Vercel serverless functions in the `/api/` directory that proxy external financial data requests with server-side API keys
- **Landing_Page**: The public route at `/` that describes the app and provides a call-to-action to sign up
- **Protected_Routes**: App pages (Analyze, Portfolio, Journal) that require an authenticated session to access
- **Session**: A Supabase Auth session token representing an authenticated user
- **Disclaimer**: A legal notice stating "This is not investment advice"

## Requirements

### Requirement 1: User Registration

**User Story:** As a new visitor, I want to create an account with my email and password, so that I can access the investment analysis tools.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email and password on the sign-up form, THE Auth_Service SHALL create a new user account and return a Session.
2. THE App SHALL validate that the email field contains a valid email format before submitting to Auth_Service.
3. THE App SHALL validate that the password field contains a minimum of 6 characters before submitting to Auth_Service.
4. IF the submitted email is already registered, THEN THE App SHALL display an error message indicating the email is already in use.
5. IF the Auth_Service returns a registration error, THEN THE App SHALL display the error message to the visitor.

### Requirement 2: User Sign-In

**User Story:** As a registered user, I want to sign in with my email and password, so that I can access my personal data and analysis tools.

#### Acceptance Criteria

1. WHEN a user submits valid credentials on the sign-in form, THE Auth_Service SHALL authenticate the user and return a Session.
2. IF the submitted credentials are invalid, THEN THE App SHALL display an error message indicating incorrect email or password.
3. WHEN a user is successfully authenticated, THE App SHALL redirect the user to the Analyze page.
4. WHILE a valid Session exists in the browser, THE App SHALL maintain the user's authenticated state across page refreshes.

### Requirement 3: User Sign-Out

**User Story:** As an authenticated user, I want to sign out of my account, so that I can secure my session on shared devices.

#### Acceptance Criteria

1. THE App SHALL display a sign-out button in the navigation bar for authenticated users.
2. WHEN an authenticated user clicks the sign-out button, THE Auth_Service SHALL invalidate the current Session.
3. WHEN the Session is invalidated, THE App SHALL redirect the user to the Landing_Page.

### Requirement 4: Route Protection

**User Story:** As a product owner, I want app pages to be accessible only to authenticated users, so that the platform is secured for registered users.

#### Acceptance Criteria

1. WHILE no valid Session exists, THE App SHALL redirect requests to Protected_Routes (Analyze, Portfolio, Journal) to the sign-in page.
2. WHILE a valid Session exists, THE App SHALL allow access to Protected_Routes.
3. THE Landing_Page SHALL remain accessible to all visitors regardless of authentication state.
4. THE sign-in and sign-up pages SHALL remain accessible to unauthenticated visitors.

### Requirement 5: Landing Page

**User Story:** As a new visitor, I want to see a public page explaining what the app does, so that I can decide whether to sign up.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a description of the app's investment analysis capabilities.
2. THE Landing_Page SHALL display a call-to-action button that navigates to the sign-up page.
3. THE Landing_Page SHALL be served at the `/` route.
4. WHILE a valid Session exists, THE Landing_Page SHALL display a call-to-action button that navigates to the Analyze page instead of the sign-up page.

### Requirement 6: Portfolio Data Persistence

**User Story:** As an authenticated user, I want my portfolio holdings stored in the cloud, so that I can access them from any device.

#### Acceptance Criteria

1. WHEN an authenticated user adds a holding, THE Database SHALL store the holding associated with the user's account.
2. WHEN an authenticated user loads the Portfolio page, THE App SHALL retrieve holdings belonging only to that user from the Database.
3. WHEN an authenticated user updates a holding, THE Database SHALL update only the holding belonging to that user.
4. WHEN an authenticated user deletes a holding, THE Database SHALL remove only the holding belonging to that user.
5. THE Database SHALL enforce row-level security so that a user can access only holdings associated with the user's own account.

### Requirement 7: Decision Journal Data Persistence

**User Story:** As an authenticated user, I want my decision journal entries stored in the cloud, so that I can review my investment decisions from any device.

#### Acceptance Criteria

1. WHEN an authenticated user creates a journal entry, THE Database SHALL store the entry associated with the user's account.
2. WHEN an authenticated user loads the Journal page, THE App SHALL retrieve journal entries belonging only to that user from the Database.
3. WHEN an authenticated user updates a journal entry, THE Database SHALL update only the entry belonging to that user.
4. WHEN an authenticated user deletes a journal entry, THE Database SHALL remove only the entry belonging to that user.
5. THE Database SHALL enforce row-level security so that a user can access only journal entries associated with the user's own account.

### Requirement 8: Authenticated API Proxy

**User Story:** As a product owner, I want API keys stored server-side and requests authenticated, so that keys are not exposed to the client.

#### Acceptance Criteria

1. THE API_Proxy SHALL store all external API keys as server-side environment variables, not in client-side code.
2. WHEN a request is received by the API_Proxy, THE API_Proxy SHALL verify that the request includes a valid Session token.
3. IF a request to the API_Proxy does not include a valid Session token, THEN THE API_Proxy SHALL return a 401 Unauthorized response.
4. WHEN a valid Session token is verified, THE API_Proxy SHALL forward the request to the external financial data service using the server-side API key.
5. THE App SHALL include the current Session token in all requests to the API_Proxy.

### Requirement 9: Legal Disclaimer

**User Story:** As a product owner, I want a legal disclaimer displayed to users, so that the platform communicates it does not provide investment advice.

#### Acceptance Criteria

1. THE App SHALL display the text "This is not investment advice" as a visible disclaimer.
2. THE Landing_Page SHALL display the Disclaimer.
3. THE App SHALL display the Disclaimer in the footer of Protected_Routes.
