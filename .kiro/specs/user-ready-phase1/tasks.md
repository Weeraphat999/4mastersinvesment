# Implementation Plan: User-Ready Phase 1

## Overview

Transform the Four Masters Investor app into a multi-user platform by adding Supabase Auth (email/password), migrating portfolio and journal data to Supabase PostgreSQL with RLS, securing API keys behind authenticated Vercel serverless functions, adding a public landing page, and displaying a legal disclaimer.

## Tasks

- [x] 1. Set up Supabase client and auth infrastructure
  - [x] 1.1 Install Supabase dependency and create client singleton
    - Install `@supabase/supabase-js` package
    - Create `src/lib/supabase.ts` with `createClient` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
    - Update `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
    - _Requirements: 1.1, 2.1_

  - [x] 1.2 Create AuthContext provider with session management
    - Create `src/contexts/AuthContext.tsx` with `AuthContextValue` interface (`user`, `session`, `loading`, `signUp`, `signIn`, `signOut`)
    - Subscribe to `supabase.auth.onAuthStateChange` to maintain session state across refreshes
    - Wrap the app with `AuthProvider` in the root component
    - _Requirements: 1.1, 2.1, 2.4, 3.2_

  - [x] 1.3 Create auth validation utilities
    - Create `src/utils/authValidation.ts` with `validateEmail` and `validatePassword` functions
    - Email validation: reject strings not matching `<non-whitespace>@<non-whitespace>.<non-whitespace>`
    - Password validation: reject strings with fewer than 6 characters
    - _Requirements: 1.2, 1.3_

  - [x]* 1.4 Write property tests for auth validation
    - **Property 1: Email validation rejects invalid formats**
    - **Property 2: Password validation enforces minimum length**
    - **Validates: Requirements 1.2, 1.3**

- [x] 2. Implement auth pages and route protection
  - [x] 2.1 Create SignUpPage component
    - Create `src/pages/SignUpPage.tsx` with email/password form fields
    - Apply client-side validation using `validateEmail` and `validatePassword` before submission
    - Call `signUp()` from AuthContext on valid submission
    - Display error messages for validation failures, duplicate email, and Auth_Service errors
    - Include link to sign-in page for existing users
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Create SignInPage component
    - Create `src/pages/SignInPage.tsx` with email/password form fields
    - Call `signIn()` from AuthContext on submission
    - On success, redirect to `/analyze`
    - Display error message for invalid credentials
    - Include link to sign-up page for new users
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.3 Create ProtectedRoute wrapper component
    - Create `src/components/ProtectedRoute.tsx`
    - Show loading spinner while auth state is loading
    - Redirect to `/signin` when no valid session exists
    - Render children when session is valid
    - _Requirements: 4.1, 4.2_

  - [x]* 2.4 Write property test for route protection logic
    - **Property 3: Route protection grants access if and only if session exists**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 2.5 Add sign-out button to navigation bar
    - Update `src/components/NavigationBar.tsx` to show sign-out button for authenticated users
    - Call `signOut()` from AuthContext on click
    - Redirect to landing page after sign-out
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Checkpoint - Auth layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create landing page and update routing
  - [x] 4.1 Create LandingPage component
    - Create `src/pages/LandingPage.tsx` served at `/` route
    - Display app description of investment analysis capabilities
    - Show CTA button linking to `/signup` when unauthenticated, `/analyze` when authenticated
    - Display legal disclaimer
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.2_

  - [x] 4.2 Create Disclaimer component
    - Create `src/components/Disclaimer.tsx` as a reusable footer component
    - Display text "This is not investment advice" with appropriate styling
    - _Requirements: 9.1_

  - [x] 4.3 Update App routing configuration
    - Update `src/App.tsx` route structure with public routes (`/`, `/signin`, `/signup`) and protected routes (`/analyze`, `/portfolio`, `/journal`)
    - Wrap protected routes with `ProtectedRoute` component
    - Add `Disclaimer` component to footer of all protected route layouts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.3_

  - [x]* 4.4 Write property test for disclaimer presence
    - **Property 6: Disclaimer appears in all protected route footers**
    - **Validates: Requirements 9.3**

- [x] 5. Implement data persistence layer
  - [x] 5.1 Create portfolio service with Supabase operations
    - Create `src/services/portfolioService.ts` with `getHoldings`, `addHolding`, `updateHolding`, `deleteHolding` functions
    - Implement camelCase/snake_case mapping between client types and database columns
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Create journal service with Supabase operations
    - Create `src/services/journalService.ts` with `getJournalEntries`, `createJournalEntry`, `updateJournalEntry`, `deleteJournalEntry` functions
    - Implement camelCase/snake_case mapping between client types and database columns
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 5.3 Integrate portfolio service into Portfolio page
    - Replace localStorage calls in portfolio components with `portfolioService` functions
    - Add loading states and error handling (toast notifications)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.4 Integrate journal service into Journal page
    - Replace localStorage calls in journal components with `journalService` functions
    - Add loading states and error handling (toast notifications)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]* 5.5 Write unit tests for portfolio and journal services
    - Test CRUD operations with mocked Supabase client
    - Test camelCase/snake_case mapping correctness
    - Test error handling scenarios
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

- [x] 6. Checkpoint - Data layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement authenticated API proxy
  - [x] 7.1 Create API auth middleware
    - Create `api/_middleware/auth.ts` with `verifyAuth` function
    - Validate `Authorization: Bearer <token>` header using Supabase `getUser()`
    - Return 401 Unauthorized for missing or invalid tokens
    - Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side environment variables
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.2 Update existing API proxy functions to use auth middleware
    - Update `api/quote.ts`, `api/search.ts`, `api/profile.ts`, `api/historical.ts` to call `verifyAuth` before processing
    - Ensure API keys are only accessed server-side via `process.env`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.3 Create authenticated API client
    - Create `src/services/apiClient.ts` with `authenticatedFetch` function
    - Attach current session's access token as `Authorization: Bearer` header to all requests
    - Throw error if no active session exists
    - _Requirements: 8.5_

  - [x] 7.4 Update frontend API calls to use authenticated client
    - Replace direct `fetch` calls in analysis components with `authenticatedFetch`
    - Handle 401 responses by redirecting to sign-in page
    - _Requirements: 8.4, 8.5_

  - [x]* 7.5 Write property tests for API auth middleware
    - **Property 4: API proxy rejects unauthenticated requests**
    - **Property 5: Authenticated API client attaches session token**
    - **Validates: Requirements 8.2, 8.3, 8.5**

- [x] 8. Create database migration SQL
  - [x] 8.1 Create SQL migration file for holdings and journal_entries tables
    - Create `supabase/migrations/001_create_tables.sql` with `holdings` and `journal_entries` table definitions
    - Include UUID primary keys, `user_id` foreign key to `auth.users`, all required columns with constraints
    - Enable Row Level Security on both tables
    - Create RLS policies for user-scoped access (`auth.uid() = user_id`)
    - _Requirements: 6.5, 7.5_

- [x] 9. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Supabase project must be created and environment variables configured before running the app
- Database migrations should be applied via Supabase dashboard or CLI before testing data persistence

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1", "2.2", "2.3", "4.2"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.1", "4.3"] },
    { "id": 4, "tasks": ["4.4", "5.1", "5.2", "7.1", "8.1"] },
    { "id": 5, "tasks": ["5.3", "5.4", "7.2", "7.3"] },
    { "id": 6, "tasks": ["5.5", "7.4"] },
    { "id": 7, "tasks": ["7.5"] }
  ]
}
```
