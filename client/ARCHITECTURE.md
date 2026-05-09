# Frontend Architecture Overview

## Component Tree

```
App (main.tsx)
└── AppProviders
    ├── QueryClientProvider
    └── RouterProvider
        ├── Public Routes
        │   ├── /login → LoginPage
        │   └── /register → RegisterPage
        │
        └── Protected Routes (ProtectedRoute wrapper)
            └── AppLayout
                ├── Sidebar
                │   ├── Navigation Links
                │   └── User Info + Logout
                │
                ├── Top Navbar
                │   └── User Welcome
                │
                └── Main Content (Outlet)
                    ├── /projects → ProjectsListPage
                    └── /projects/:id → ProjectDetailsPage
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Action                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│  • LoginPage, RegisterPage, ProjectsListPage, etc.          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  TanStack Query Hook                        │
│  • useLoginMutation()                                       │
│  • useRegisterMutation()                                    │
│  • useLogoutMutation()                                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Axios Instance                           │
│  • baseURL from env                                         │
│  • withCredentials: true                                    │
│  • Request/Response Interceptors                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API                               │
│  • POST /auth/login                                         │
│  • POST /auth/register                                      │
│  • GET /auth/profile                                        │
│  • POST /auth/logout                                        │
│  • Sets HTTP-only cookies                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Response Handler                           │
│  • Success: Update Zustand store                            │
│  • 401: Clear auth + redirect to /login                     │
│  • Other errors: Show error message                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Zustand Auth Store Update                      │
│  • setUser(user) - on success                               │
│  • clearUser() - on 401/logout                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI Re-render                             │
│  • Protected routes become accessible                       │
│  • User info displayed in sidebar                           │
│  • Navigate to protected pages                              │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
App Mount
    │
    ▼
AppProviders useEffect
    │
    ▼
authStore.checkAuth()
    │
    ├─── GET /auth/profile ───┐
    │                          │
    │                          ▼
    │                    200 Success
    │                          │
    │                          ▼
    │                   setUser(user)
    │                          │
    │                          ▼
    │               isAuthenticated = true
    │               isLoading = false
    │                          │
    │                          ▼
    │              Protected routes accessible
    │
    └─── GET /auth/profile ───┐
                              │
                              ▼
                         401 Unauthorized
                               │
                               ▼
                         clearUser()
                               │
                               ▼
                    isAuthenticated = false
                    isLoading = false
                               │
                               ▼
                   ProtectedRoute redirects to /login
```

## State Management

```
┌──────────────────────────────────────────────────────┐
│                  Global State                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Zustand (Auth State)                                │
│  ├── user: User | null                               │
│  ├── isAuthenticated: boolean                        │
│  └── isLoading: boolean                              │
│                                                      │
│  TanStack Query (Server State)                       │
│  ├── Mutations                                       │
│  │   ├── useLoginMutation                            │
│  │   ├── useRegisterMutation                         │
│  │   └── useLogoutMutation                           │
│  │                                                   │
│  └── Queries (future)                                │
│      ├── useProjectsQuery                            │
│      ├── useProjectQuery                             │
│      └── useTasksQuery                               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## File Dependencies

```
main.tsx
  └── imports AppProviders
       ├── imports QueryClientProvider
       │    └── uses queryClient from lib/queryClient.ts
       │
       └── imports RouterProvider
            └── uses router from app/router.tsx
                 ├── imports ProtectedRoute
                 │    └── uses useAuthStore from stores/auth.store.ts
                 │
                 ├── imports AppLayout
                 │    ├── uses useAuthStore
                 │    └── uses useLogoutMutation from features/auth/api.ts
                 │         └── uses apiClient from lib/axios.ts
                 │              └── uses useAuthStore
                 │
                 └── imports Page components
                      ├── LoginPage
                      │    └── uses useLoginMutation
                      │
                      ├── RegisterPage
                      │    └── uses useRegisterMutation
                      │
                      ├── ProjectsListPage
                      └── ProjectDetailsPage
```

## Request/Response Flow

### Successful Login

```
1. User fills login form
   └─> LoginPage component

2. User clicks "Login"
   └─> handleSubmit()
       └─> loginMutation.mutateAsync({ email, password })
           └─> POST /auth/login with credentials
               └─> Backend validates credentials
                   └─> Backend sets HTTP-only cookie
                       └─> Backend returns user data
                           └─> onSuccess callback
                               └─> setUser(user)
                                   └─> isAuthenticated = true
                                       └─> navigate('/projects')
                                           └─> ProtectedRoute allows access
                                               └─> AppLayout renders
                                                   └─> ProjectsListPage displays
```

### 401 Unauthorized

```
1. Any API request fails with 401
   └─> Axios response interceptor catches error
       └─> if (error.response?.status === 401)
           └─> useAuthStore.getState().clearUser()
               ├─> user = null
               ├─> isAuthenticated = false
               └─> isLoading = false

           └─> window.location.href = '/login'
               └─> User redirected to login page
```

### Page Refresh

```
1. User refreshes page
   └─> App remounts
       └─> AppProviders useEffect runs
           └─> checkAuth() called
               └─> GET /auth/profile
                   │
                   ├─> If cookie valid (200)
                   │   └─> setUser(user)
                   │       └─> User stays logged in
                   │           └─> Protected pages accessible
                   │
                   └─> If cookie invalid (401)
                       └─> clearUser()
                           └─> User redirected to login
```

## Folder Structure Rationale

```
features/
  └─ Co-located feature code
     ├─ auth/           # Everything auth-related
     │  ├─ api.ts       # API hooks
     │  └─ pages/       # Auth pages
     │
     └─ projects/       # Everything projects-related
        ├─ api.ts       # API hooks (future)
        └─ pages/       # Project pages

components/
  ├─ ui/               # Reusable UI primitives
  └─ layout/           # Layout components

lib/                   # Shared utilities
  ├─ axios.ts          # HTTP client
  ├─ queryClient.ts    # React Query config
  └─ utils.ts          # Helper functions

stores/                # Global state
  └─ auth.store.ts     # Auth Zustand store

app/                   # App-level config
  ├─ router.tsx        # Routes
  └─ providers.tsx     # Providers
```

This structure:

- ✅ Scales well with new features
- ✅ Easy to find related code
- ✅ Prevents circular dependencies
- ✅ Clear separation of concerns
- ✅ Industry standard pattern
