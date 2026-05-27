# Design Document

## Overview

This document describes the architecture for transforming the Four Masters Investor app from a single-user localStorage-based application into a multi-user platform with Supabase Auth, cloud-persisted data, authenticated API proxies, a public landing page, and a legal disclaimer.

## Architecture

The system introduces four new architectural layers:

1. **Auth Layer** — Supabase Auth client for email/password registration, sign-in, sign-out, and session management
2. **Data Layer** — Supabase PostgreSQL client replacing localStorage for portfolio holdings and decision journal entries
3. **Route Guard Layer** — React Router wrapper that enforces authentication on protected routes
4. **API Auth Middleware** — Vercel serverless function middleware that validates session tokens before proxying requests

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Landing  │  │  Auth Pages  │  │ Protected Routes │  │
│  │  Page    │  │ (Sign-in/up) │  │ (Analyze/Port/J) │  │
│  └──────────┘  └──────────────┘  └────────┬─────────┘  │
│                        │                    │            │
│                 ┌──────┴────────────────────┴──────┐    │
│                 │         AuthProvider Context      │    │
│                 └──────────────┬───────────────────┘    │
└────────────────────────────────┼────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
    ┌─────────▼──────┐  ┌───────▼────────┐  ┌──────▼──────┐
    │  Supabase Auth │  │ Supabase DB    │  │ Vercel API  │
    │  (sessions)    │  │ (holdings,     │  │ Proxy       │
    │                │  │  journal)       │  │ (+ auth MW) │
    └────────────────┘  └────────────────┘  └─────────────┘
```

## Components and Interfaces

### 1. Supabase Client (`src/lib/supabase.ts`)

A singleton Supabase client initialized with project URL and anon key from environment variables.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. AuthProvider (`src/contexts/AuthContext.tsx`)

A React context that wraps the app and provides authentication state and methods.

```typescript
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}
```

The provider subscribes to `supabase.auth.onAuthStateChange` to keep state in sync across tabs and refreshes.

### 3. ProtectedRoute (`src/components/ProtectedRoute.tsx`)

A wrapper component that checks authentication state and redirects unauthenticated users to the sign-in page.

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}
```

### 4. Form Validation (`src/utils/authValidation.ts`)

Pure validation functions for sign-up/sign-in form fields.

```typescript
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}
```

### 5. Auth Pages

#### SignUpPage (`src/pages/SignUpPage.tsx`)

- Email and password input fields with client-side validation
- Calls `signUp()` from AuthContext on submit
- Displays error messages from validation or Auth_Service
- Links to sign-in page for existing users

#### SignInPage (`src/pages/SignInPage.tsx`)

- Email and password input fields
- Calls `signIn()` from AuthContext on submit
- On success, redirects to `/analyze`
- Displays error messages for invalid credentials
- Links to sign-up page for new users

### 6. Landing Page (`src/pages/LandingPage.tsx`)

- Served at `/` route
- Displays app description and investment analysis capabilities
- Shows CTA button: links to `/signup` when unauthenticated, `/analyze` when authenticated
- Displays legal disclaimer

### 7. Data Services

#### Portfolio Service (`src/services/portfolioService.ts`)

Replaces localStorage calls with Supabase database operations.

```typescript
import { supabase } from '../lib/supabase';
import type { PortfolioHolding } from '../data/types';

export async function getHoldings(): Promise<PortfolioHolding[]> {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
```

```typescript
export async function addHolding(
  holding: Omit<PortfolioHolding, 'id'>
): Promise<PortfolioHolding> {
  const { data, error } = await supabase
    .from('holdings')
    .insert(holding)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHolding(
  id: string,
  updates: Partial<PortfolioHolding>
): Promise<PortfolioHolding> {
  const { data, error } = await supabase
    .from('holdings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHolding(id: string): Promise<void> {
  const { error } = await supabase.from('holdings').delete().eq('id', id);
  if (error) throw error;
}
```

#### Journal Service (`src/services/journalService.ts`)

Same pattern as portfolio service for decision journal entries.

```typescript
export async function getJournalEntries(): Promise<DecisionEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}
```

```typescript
export async function createJournalEntry(
  entry: Omit<DecisionEntry, 'id'>
): Promise<DecisionEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<DecisionEntry>
): Promise<DecisionEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
```

### 8. API Auth Middleware (`api/_middleware/auth.ts`)

Shared middleware for Vercel serverless functions that validates the session token.

```typescript
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
```

```typescript
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verifyAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return data.user.id;
}
```

### 9. Authenticated API Client (`src/services/apiClient.ts`)

A wrapper that attaches the session token to all API proxy requests.

```typescript
import { supabase } from '../lib/supabase';

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}
```

### 10. Disclaimer Component (`src/components/Disclaimer.tsx`)

A reusable footer component displaying the legal disclaimer text.

```typescript
export function Disclaimer() {
  return (
    <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-700 mt-8">
      ⚠️ This is not investment advice
    </footer>
  );
}
```

## Interfaces

### Route Configuration

```typescript
// Updated App.tsx route structure
<Routes>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/signin" element={<SignInPage />} />
  <Route path="/signup" element={<SignUpPage />} />

  {/* Protected routes */}
  <Route path="/analyze" element={
    <ProtectedRoute><AnalyzePage /></ProtectedRoute>
  } />
  <Route path="/portfolio" element={
    <ProtectedRoute><PortfolioPage /></ProtectedRoute>
  } />
  <Route path="/journal" element={
    <ProtectedRoute><JournalPage /></ProtectedRoute>
  } />
</Routes>
```

### Environment Variables

**Client-side (`.env`):**
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

**Server-side (Vercel environment):**
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
FMP_API_KEY=<financial-modeling-prep-key>
ALPHA_VANTAGE_API_KEY=<alpha-vantage-key>
```

## Data Models

### Database Schema

#### `holdings` table

```sql
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  avg_cost NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own holdings"
  ON holdings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### `journal_entries` table

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('BUY', 'PASS', 'WATCHLIST')),
  position_size_percent NUMERIC NOT NULL DEFAULT 0,
  position_size_amount NUMERIC NOT NULL DEFAULT 0,
  entry_price_target NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  reasoning TEXT NOT NULL DEFAULT '',
  expected_outcome TEXT NOT NULL DEFAULT '',
  exit_plan TEXT NOT NULL DEFAULT '',
  review_dates JSONB NOT NULL DEFAULT '[]',
  scores JSONB NOT NULL DEFAULT '{}',
  alerts_set JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  actual_outcome TEXT NOT NULL DEFAULT '',
  lessons_learned TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

```sql
-- Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own journal entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### TypeScript Type Mapping

The existing `PortfolioHolding` and `DecisionEntry` interfaces remain unchanged on the client. The data services handle mapping between camelCase (client) and snake_case (database) column names.

```typescript
// Mapper example for holdings
function toClientHolding(row: DatabaseHolding): PortfolioHolding {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: row.company_name,
    shares: Number(row.shares),
    avgCost: Number(row.avg_cost),
    currentPrice: Number(row.current_price),
    purchaseDate: row.purchase_date,
    category: row.category,
    riskLevel: row.risk_level as 'low' | 'medium' | 'high',
    notes: row.notes,
  };
}

function toDatabaseHolding(
  holding: Omit<PortfolioHolding, 'id'>
): Omit<DatabaseHolding, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    ticker: holding.ticker,
    company_name: holding.companyName,
    shares: holding.shares,
    avg_cost: holding.avgCost,
    current_price: holding.currentPrice,
    purchase_date: holding.purchaseDate,
    category: holding.category,
    risk_level: holding.riskLevel,
    notes: holding.notes,
  };
}
```

## Error Handling

### Auth Errors

| Scenario | Error Source | User-Facing Message |
|----------|-------------|---------------------|
| Invalid email format | Client validation | "Please enter a valid email address" |
| Password too short | Client validation | "Password must be at least 6 characters" |
| Email already registered | Supabase Auth | "This email is already registered" |
| Invalid credentials | Supabase Auth | "Incorrect email or password" |
| Network error | Fetch/Supabase | "Unable to connect. Please try again." |
| Session expired | Supabase Auth | Auto-redirect to sign-in page |

### Data Layer Errors

| Scenario | Handling |
|----------|----------|
| Supabase query fails | Display toast notification with error message, retain current UI state |
| RLS policy blocks access | Returns empty result set (user sees no data) |
| Network timeout | Retry once, then display error message |

### API Proxy Errors

| Status Code | Meaning | Client Handling |
|-------------|---------|-----------------|
| 401 | Missing/invalid token | Redirect to sign-in |
| 400 | Bad request params | Display validation error |
| 404 | Ticker not found | Display "not found" message |
| 500 | Server error | Display generic error, suggest retry |

## Security Considerations

1. **API keys never reach the client** — All external API keys are stored as Vercel environment variables and accessed only in serverless functions.
2. **Row-Level Security** — Supabase RLS policies ensure users can only read/write their own data, even if the client is compromised.
3. **Token validation** — Every API proxy request validates the JWT token server-side using Supabase's `getUser()` method.
4. **Anon key exposure is safe** — The Supabase anon key is designed to be public; RLS policies enforce access control.
5. **HTTPS only** — All communication with Supabase and Vercel functions uses HTTPS.

## Testing Strategy

- **Property-based tests** (fast-check): Validate universal properties for input validation, route protection logic, API middleware auth checks, and disclaimer presence.
- **Example-based unit tests** (vitest + testing-library): Verify specific UI behaviors like error message display, redirect after sign-in, sign-out button visibility, and landing page content.
- **Integration tests**: Verify Supabase data layer operations (CRUD for holdings and journal entries) with mocked Supabase client.
- **Smoke tests**: Verify RLS policies are configured and API keys are not in client bundle.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Email validation rejects invalid formats

*For any* string that does not match the pattern `<non-whitespace>@<non-whitespace>.<non-whitespace>`, the email validator SHALL return `{ valid: false }` with an error message, and for any string that does match, it SHALL return `{ valid: true }`.

**Validates: Requirements 1.2**

### Property 2: Password validation enforces minimum length

*For any* string with fewer than 6 characters, the password validator SHALL return `{ valid: false }` with an error message, and for any string with 6 or more characters, it SHALL return `{ valid: true }`.

**Validates: Requirements 1.3**

### Property 3: Route protection grants access if and only if session exists

*For any* protected route path (Analyze, Portfolio, Journal), the ProtectedRoute component SHALL render the child content when a valid session exists, and SHALL redirect to the sign-in page when no valid session exists.

**Validates: Requirements 4.1, 4.2**

### Property 4: API proxy rejects unauthenticated requests

*For any* request to an API proxy endpoint that does not include a valid Bearer token in the Authorization header, the middleware SHALL respond with HTTP 401 Unauthorized without forwarding the request to the external service.

**Validates: Requirements 8.2, 8.3**

### Property 5: Authenticated API client attaches session token

*For any* API request made through the `authenticatedFetch` function, the resulting request SHALL include an `Authorization: Bearer <token>` header containing the current session's access token.

**Validates: Requirements 8.5**

### Property 6: Disclaimer appears in all protected route footers

*For any* protected route page (Analyze, Portfolio, Journal), the rendered output SHALL contain the text "This is not investment advice" within a footer element.

**Validates: Requirements 9.3**
