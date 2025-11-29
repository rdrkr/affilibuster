# User Authentication - Frontend Quickstart Guide

**Last Updated**: 2025-11-13

This guide provides a quickstart for using the authentication system in the Affilibuster frontend.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Authentication Components](#authentication-components)
- [Using the Auth Hook](#using-the-auth-hook)
- [Protecting Routes](#protecting-routes)
- [Common Patterns](#common-patterns)
- [Testing](#testing)

## Overview

The frontend authentication system provides:

- Complete auth UI components (Login, Register, Password Reset, Email Verification, Profile Management)
- Auth context and hooks for managing authentication state
- Type-safe API client for auth operations
- Cookie-based session management
- Automatic auth state synchronization

## Prerequisites

1. **Backend API Running**: The backend API must be running at `NEXT_PUBLIC_API_URL`
2. **Environment Variables**: Configure in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

## Authentication Components

All auth components are located in `src/components/auth/` and can be imported from the barrel export:

```typescript
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  ResendVerificationForm,
  ProfileForm,
} from '@/components/auth'
```

### LoginForm

Renders a login form with email/password inputs and remember me checkbox.

```tsx
import { LoginForm } from '@/components/auth'

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <LoginForm
        onSuccess={() => {
          console.log('Login successful!')
        }}
        onRegisterClick={() => {
          router.push('/register')
        }}
      />
    </div>
  )
}
```

**Props**:

- `onSuccess?: () => void` - Called after successful login
- `onRegisterClick?: () => void` - Called when "Sign Up" link is clicked
- `onForgotPasswordClick?: () => void` - Called when "Forgot Password" link is clicked

### RegisterForm

Renders a registration form with email, password, display name inputs.

```tsx
import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <RegisterForm
        onSuccess={() => {
          router.push('/verify-email')
        }}
        onLoginClick={() => {
          router.push('/login')
        }}
      />
    </div>
  )
}
```

**Props**:

- `onSuccess?: () => void` - Called after successful registration
- `onLoginClick?: () => void` - Called when "Log In" link is clicked

### ForgotPasswordForm

Renders a form to request password reset email.

```tsx
import { ForgotPasswordForm } from '@/components/auth'

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <ForgotPasswordForm
        onSuccess={() => {
          console.log('Reset email sent!')
        }}
      />
    </div>
  )
}
```

### ResetPasswordForm

Renders a form to set a new password using a reset token.

```tsx
import { ResetPasswordForm } from '@/components/auth'

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token: string }
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <ResetPasswordForm
        token={searchParams.token}
        onSuccess={() => {
          router.push('/login')
        }}
      />
    </div>
  )
}
```

**Props**:

- `token: string` - Reset token from email (required)
- `onSuccess?: () => void` - Called after successful password reset
- `onLoginClick?: () => void` - Called when "Log In" link is clicked

### ResendVerificationForm

Renders a form for authenticated users to resend email verification.

```tsx
import { ResendVerificationForm } from '@/components/auth'

export default function ResendVerificationPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <ResendVerificationForm
        onSuccess={() => {
          console.log('Verification email sent!')
        }}
      />
    </div>
  )
}
```

**Note**: Requires user to be authenticated.

### ProfileForm

Renders a form for updating user profile information.

```tsx
import { ProfileForm } from '@/components/auth'

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <ProfileForm
        onSuccess={() => {
          console.log('Profile updated!')
        }}
      />
    </div>
  )
}
```

**Note**: Requires user to be authenticated.

## Using the Auth Hook

The `useAuth` hook provides access to authentication state and methods:

```tsx
import { useAuth } from '@/lib/auth'

export function MyComponent() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
      <button onClick={() => logout()}>Log Out</button>
    </div>
  )
}
```

**Available Properties**:

- `user: User | null` - Current authenticated user
- `isLoading: boolean` - Whether auth state is being loaded
- `isAuthenticated: boolean` - Whether user is authenticated
- `error: string | null` - Current error message

**Available Methods**:

- `login(email, password, rememberMe?)` - Log in user
- `register(email, password, displayName)` - Register new user
- `logout()` - Log out current user
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password with token
- `verifyEmail(token)` - Verify email address
- `resendVerification()` - Resend verification email
- `refresh()` - Refresh authentication token
- `clearError()` - Clear error state

## Protecting Routes

### Server Components

For server-side route protection, check auth in the page component:

```tsx
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  // Server-side auth check would go here
  // For now, rely on client-side protection

  return (
    <AuthProvider>
      <ProtectedContent />
    </AuthProvider>
  )
}
```

### Client Components

For client-side route protection, use the `useAuth` hook:

```tsx
'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <div>Protected content here</div>
}
```

### Higher-Order Component Pattern

Create a reusable HOC for protected routes:

```tsx
// src/lib/auth/withAuth.tsx
'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, ComponentType } from 'react'

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  redirectTo = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isAuthenticated, isLoading])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Usage
const ProtectedPage = withAuth(MyPageComponent)
```

## Common Patterns

### Conditional Rendering Based on Auth State

```tsx
import { useAuth } from '@/lib/auth'

export function ConditionalContent() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome back, {user?.displayName}!</h1>
          <ProfileButton />
        </div>
      ) : (
        <div>
          <h1>Welcome, Guest!</h1>
          <LoginButton />
          <SignUpButton />
        </div>
      )}
    </div>
  )
}
```

### Handling Auth Errors

```tsx
import { useAuth } from '@/lib/auth'

export function LoginWithErrorHandling() {
  const { login, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(email, password)
      // Redirect on success
      router.push('/dashboard')
    } catch (err) {
      // Error is automatically set in context
      console.error('Login failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </form>
  )
}
```

### Displaying User Info in Navigation

The Navigation component automatically shows auth UI based on auth state:

```tsx
import { Navigation } from '@/components/Navigation'

export function Layout({ children }) {
  return (
    <div>
      <Navigation data={navData} lang="en" />
      {children}
    </div>
  )
}
```

When authenticated, shows:

- User dropdown with display name
- Profile link
- Settings link
- Log out button

When not authenticated, shows:

- Log In button
- Sign Up button

## Testing

### Unit Testing Components with Auth

Mock the useAuth hook in tests:

```typescript
import { useAuth } from '@/lib/auth'

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}))

describe('MyComponent', () => {
  it('should show login button when not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: jest.fn(),
    })

    render(<MyComponent />)

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should show user info when authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        status: 'active',
        createdAt: '2025-11-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
        lastLoginAt: '2025-11-01T10:00:00Z',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: jest.fn(),
    })

    render(<MyComponent />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
```

### Testing Auth Forms

Auth form components are tested with full coverage. See `tests/components/auth/` for examples.

Example test pattern:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'
import * as authApi from '@/lib/auth/api'

jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('LoginForm', () => {
  it('should handle successful login', async () => {
    mockedAuthApi.login.mockResolvedValueOnce({
      success: true,
      user: mockUser,
    })

    const onSuccess = jest.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    const form = screen.getByLabelText(/email/i).closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
```

## Type Definitions

All auth types are defined in `src/lib/auth/types.ts`:

```typescript
// User information
export interface User {
  id: string
  email: string
  displayName: string
  emailVerified: boolean
  status: 'active' | 'locked' | 'deleted'
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

// Auth context type
export interface AuthContextType {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User | null>
  register: (email: string, password: string, displayName: string) => Promise<User | null>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  verifyEmail: (token: string) => Promise<boolean>
  resendVerification: () => Promise<boolean>
  refresh: () => Promise<User | null>
  clearError: () => void
}
```

## API Client

The auth API client is in `src/lib/auth/api.ts` and provides type-safe functions for all auth operations:

```typescript
import * as authApi from '@/lib/auth/api'

// Login
const response = await authApi.login('user@example.com', 'password123', true)

// Register
const response = await authApi.register('user@example.com', 'password123', 'John Doe')

// Logout
await authApi.logout()

// Forgot password
await authApi.forgotPassword('user@example.com')

// Reset password
await authApi.resetPassword('reset-token-123', 'newpassword123')

// Verify email
await authApi.verifyEmail('verify-token-123')

// Resend verification
await authApi.resendVerification()

// Refresh token
const response = await authApi.refresh()

// Update profile
const response = await authApi.updateProfile({
  displayName: 'New Name',
  email: 'newemail@example.com',
})
```

All API functions:

- Use cookie-based authentication (credentials: 'include')
- Return strongly typed responses
- Throw errors with meaningful messages
- Are fully tested with 100% coverage

## Architecture

```
frontend/src/
├── lib/auth/
│   ├── api.ts              # API client functions
│   ├── types.ts            # TypeScript type definitions
│   ├── AuthContext.tsx     # React context for auth state
│   ├── AuthProvider.tsx    # Auth provider component
│   ├── useAuth.ts          # Custom hook for auth
│   └── index.ts            # Barrel export
├── components/auth/
│   ├── LoginForm.tsx       # Login form component
│   ├── RegisterForm.tsx    # Registration form component
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ResendVerificationForm.tsx
│   ├── ProfileForm.tsx     # Profile update form
│   └── index.ts            # Barrel export
└── components/
    └── Navigation.tsx      # Navigation with auth UI
```

## Notes

- **Cookie-Based Auth**: All API requests include cookies automatically
- **Session Management**: Sessions expire after 7 days (30 days with rememberMe)
- **Email Verification**: Users receive verification email after registration
- **Password Requirements**: Minimum 8 characters
- **Type Safety**: All components and hooks are fully typed
- **Test Coverage**: 100% line coverage for auth components
- **Accessibility**: All forms follow WCAG 2.1 AA standards

## Next Steps

1. **E2E Tests**: Add end-to-end tests for complete auth flows when backend is available
2. **Social Login**: Integrate OAuth providers (Google, GitHub, etc.)
3. **Two-Factor Authentication**: Add 2FA support for enhanced security
4. **Session Timeout**: Add automatic session timeout warnings
5. **Remember Device**: Add "remember this device" functionality

## Support

For issues or questions:

- Check existing tests in `tests/components/auth/` for examples
- Review component props and types in source files
- See CLAUDE.md for project-wide guidelines
