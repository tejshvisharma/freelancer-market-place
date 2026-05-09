# SkillSphere – Frontend Architecture Guide
> Authored for a senior-grade production setup. React + Vite + TypeScript stack.

---

## 1. TECH STACK DECISIONS (WITH RATIONALE)

| Concern | Choice | Why |
|---|---|---|
| Build Tool | Vite + SWC | Fastest HMR, native ESM, SWC replaces Babel |
| Language | TypeScript (strict) | Full type safety across API layer, stores, components |
| Routing | React Router v6 (Data Router) | Loaders, actions, nested layouts, code splitting |
| Server State | TanStack Query v5 | Caching, background refetch, optimistic updates |
| Client State | Zustand v4 | Minimal boilerplate, devtools, persist middleware |
| HTTP | Axios + custom instance | Interceptors for token refresh, base URL, error normalization |
| Forms | React Hook Form + Zod | Type-safe schemas, resolver integration, zero re-renders |
| UI Base | shadcn/ui (Radix primitives) | Accessible, unstyled, fully customizable |
| Styling | Tailwind CSS v3 | Utility-first, purge, design tokens via CSS vars |
| Rich Components | MUI (select use cases only) | DataGrid for admin tables, DatePicker for scheduler |
| Notifications | React Hot Toast | Lightweight, promise-aware toasts |
| Icons | Lucide React | Tree-shakeable, consistent style |
| Animation | Framer Motion | Page transitions, micro-interactions |
| Real-time | Socket.IO client | Chat, notifications |
| Charts | Recharts | Freelancer analytics dashboard |
| Upload | React Dropzone | Portfolio, resume, evidence upload |
| Date/Time | Day.js | Lightweight, immutable, timezone support |
| Table | TanStack Table v8 | Headless, works with any UI library |
| Testing | Vitest + React Testing Library | Vite-native, fast, same config |
| Code Quality | ESLint + Prettier + Husky + lint-staged | Pre-commit enforcement |

---

## 2. PROJECT FOLDER STRUCTURE

```
src/
├── app/                          # App bootstrap
│   ├── App.tsx                   # Root component
│   ├── router.tsx                # All routes (React Router data router)
│   └── providers.tsx             # QueryClient, Toaster, theme wrappers
│
├── assets/                       # Static files (images, fonts)
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui generated components (DO NOT edit manually)
│   ├── common/                   # App-wide shared components
│   │   ├── AppLayout.tsx         # Root shell with sidebar + header
│   │   ├── AuthLayout.tsx        # Centered card layout for auth pages
│   │   ├── ProtectedRoute.tsx    # Role-aware route guard
│   │   ├── Spinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── PageMeta.tsx          # Head/title management
│   └── features/                 # Feature-specific components (NOT pages)
│       ├── auth/
│       ├── gigs/
│       ├── chat/
│       ├── profile/
│       ├── payments/
│       └── admin/
│
├── features/                     # Feature modules (business logic layer)
│   ├── auth/
│   │   ├── api/                  # API calls (used by TanStack Query hooks)
│   │   │   └── auth.api.ts
│   │   ├── hooks/                # useQuery / useMutation hooks
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useLogout.ts
│   │   │   ├── useCurrentUser.ts
│   │   │   └── ...
│   │   ├── schemas/              # Zod validation schemas
│   │   │   └── auth.schema.ts
│   │   └── types/                # TypeScript interfaces for this feature
│   │       └── auth.types.ts
│   ├── gigs/
│   ├── proposals/
│   ├── chat/
│   ├── payments/
│   ├── reviews/
│   ├── notifications/
│   └── admin/
│
├── pages/                        # Route-level page components (thin, compose features)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   └── TwoFactorPage.tsx
│   ├── dashboard/
│   │   ├── ClientDashboard.tsx
│   │   └── FreelancerDashboard.tsx
│   ├── gigs/
│   ├── profile/
│   ├── chat/
│   ├── payments/
│   └── admin/
│
├── lib/                          # Core infrastructure (no business logic)
│   ├── axios.ts                  # Axios instance + interceptors
│   ├── queryClient.ts            # TanStack QueryClient config
│   ├── socket.ts                 # Socket.IO singleton
│   └── utils.ts                  # cn(), formatDate(), etc.
│
├── stores/                       # Zustand global stores
│   ├── auth.store.ts             # User, accessToken, isAuthenticated
│   ├── ui.store.ts               # Sidebar open/close, theme
│   └── notification.store.ts     # Unread count, socket-pushed notifications
│
├── hooks/                        # Global reusable hooks (not feature-specific)
│   ├── useAuth.ts                # Reads from auth store
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useSocket.ts
│
├── types/                        # Global TypeScript types
│   ├── api.types.ts              # ApiResponse<T>, PaginatedResponse<T>
│   ├── user.types.ts
│   └── enums.ts                  # Role, GigStatus, ProposalStatus, etc.
│
├── constants/                    # App-wide constants
│   ├── routes.ts                 # Route path constants
│   ├── queryKeys.ts              # TanStack Query key factory
│   └── config.ts                 # ENV vars, API base URL
│
└── styles/
    ├── globals.css               # Tailwind base + CSS custom properties
    └── themes/
        └── tokens.css            # Design tokens (colors, spacing)
```

---

## 3. INITIAL SETUP COMMANDS

### Step 1 – Scaffold the project

```bash
npm create vite@latest skillsphere-frontend -- --template react-ts
cd skillsphere-frontend
```

### Step 2 – Install all dependencies

```bash
# Core
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools zustand axios

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# UI & Styling
npm install tailwindcss @tailwindcss/forms postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui (installs one by one as you need, or use CLI)
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui CLI setup
npx shadcn@latest init

# MUI (for DataGrid + DatePicker only)
npm install @mui/material @mui/x-data-grid @mui/x-date-pickers @emotion/react @emotion/styled

# Notifications, Animation
npm install react-hot-toast framer-motion

# Real-time & Misc
npm install socket.io-client dayjs recharts react-dropzone

# Dev dependencies
npm install -D @types/node vitest @testing-library/react @testing-library/user-event jsdom
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react-hooks
npm install -D husky lint-staged
```

### Step 3 – Configure TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 4 – Configure Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 4. CORE INFRASTRUCTURE FILES

### lib/axios.ts – Axios instance with token refresh interceptor

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends cookies (refreshToken)
  headers: { 'Content-Type': 'application/json' },
})

// Attach accessToken from memory store to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh token on 401, retry original request once
let isRefreshing = false
let failQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh-token')
        const newToken = data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

### stores/auth.store.ts – Zustand auth store

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface User {
  _id: string
  name: string
  email: string
  role: 'client' | 'freelancer' | 'admin'
  avatar?: string
  isEmailVerified: boolean
  isTwoFactorEnabled: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
)
```

### constants/queryKeys.ts – Query key factory (prevents typos)

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  gigs: {
    all: ['gigs'] as const,
    list: (filters: Record<string, unknown>) => ['gigs', 'list', filters] as const,
    detail: (id: string) => ['gigs', id] as const,
  },
  proposals: {
    byGig: (gigId: string) => ['proposals', 'gig', gigId] as const,
    mine: ['proposals', 'mine'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  // add more as you build each feature
}
```

### types/api.types.ts – Typed API response wrappers

```typescript
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errors?: Array<{ field: string; message: string }>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

---

## 5. AUTH FEATURE EXAMPLE (Complete Implementation Pattern)

### features/auth/schemas/auth.schema.ts

```typescript
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character')

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(['client', 'freelancer']),
  phone: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

### features/auth/api/auth.api.ts

```typescript
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { LoginInput, RegisterInput } from '../schemas/auth.schema'

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'client' | 'freelancer' | 'admin'
  isEmailVerified: boolean
  isTwoFactorEnabled: boolean
  avatar?: string
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
}

export interface TwoFARequiredResponse {
  requires2FA: true
  twoFactorToken: string
}

export const authApi = {
  register: (body: RegisterInput) =>
    api.post<ApiResponse<{ user: AuthUser }>>('/auth/register', body),

  login: (body: LoginInput) =>
    api.post<ApiResponse<LoginResponse | TwoFARequiredResponse>>('/auth/login', body),

  me: () => api.get<ApiResponse<{ user: AuthUser }>>('/auth/me'),

  logout: () => api.post<ApiResponse<null>>('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.put<ApiResponse<null>>(`/auth/reset-password/${token}`, { password, confirmPassword }),

  verifyEmail: (token: string) =>
    api.get<ApiResponse<{ user: Partial<AuthUser> }>>(`/auth/verify-email/${token}`),

  resendVerification: () => api.post<ApiResponse<null>>('/auth/resend-verification'),

  refreshToken: () => api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>('/auth/refresh-token'),

  verify2FA: (twoFactorToken: string, code: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/2fa/verify', { twoFactorToken, code }),

  setup2FA: () => api.post<ApiResponse<{ qrCodeDataUrl: string; secret: string }>>('/auth/2fa/setup'),

  verifySetup2FA: (code: string) =>
    api.post<ApiResponse<{ user: Partial<AuthUser> }>>('/auth/2fa/verify-setup', { code }),

  disable2FA: (code: string) =>
    api.post<ApiResponse<{ user: Partial<AuthUser> }>>('/auth/2fa/disable', { code }),
}
```

### features/auth/hooks/useLogin.ts

```typescript
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput } from '../schemas/auth.schema'

export const useLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ data: res }) => {
      if (!res.success || !res.data) return

      const payload = res.data

      if ('requires2FA' in payload && payload.requires2FA) {
        // Navigate to 2FA page carrying the temp token in state
        navigate('/2fa', { state: { twoFactorToken: payload.twoFactorToken } })
        return
      }

      if ('accessToken' in payload) {
        setAuth(payload.user, payload.accessToken)
        toast.success(`Welcome back, ${payload.user.name}!`)

        const roleRedirect: Record<string, string> = {
          client: '/dashboard/client',
          freelancer: '/dashboard/freelancer',
          admin: '/admin',
        }
        navigate(roleRedirect[payload.user.role] ?? '/dashboard')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? 'Login failed. Please try again.'
      toast.error(message)
    },
  })
}
```

### features/auth/hooks/useCurrentUser.ts

```typescript
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { queryKeys } from '@/constants/queryKeys'

// Call this once at app boot to hydrate auth state
export const useCurrentUser = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    if (query.data?.data?.success && query.data.data.data) {
      const user = query.data.data.data.user
      if (accessToken) setAuth(user, accessToken)
    }
  }, [query.data])

  return query
}
```

---

## 6. ROUTING ARCHITECTURE

### app/router.tsx

```typescript
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/components/common/AppLayout'
import AuthLayout from '@/components/common/AuthLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import Spinner from '@/components/common/Spinner'

const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
)

// Lazy load all pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const TwoFactorPage = lazy(() => import('@/pages/auth/TwoFactorPage'))
const ClientDashboard = lazy(() => import('@/pages/dashboard/ClientDashboard'))
const FreelancerDashboard = lazy(() => import('@/pages/dashboard/FreelancerDashboard'))
// ...more lazy imports

export const router = createBrowserRouter([
  // Public auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: wrap(LoginPage) },
      { path: '/register', element: wrap(RegisterPage) },
      { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
      { path: '/reset-password/:token', element: wrap(ResetPasswordPage) },
      { path: '/verify-email/:token', element: wrap(VerifyEmailPage) },
      { path: '/2fa', element: wrap(TwoFactorPage) },
    ],
  },
  // Protected app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard/client', element: wrap(ClientDashboard) },
          { path: '/dashboard/freelancer', element: wrap(FreelancerDashboard) },
          // gigs, proposals, chat, payments, profile...
        ],
      },
    ],
  },
  // Admin routes (role-gated)
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      // admin pages
    ],
  },
])
```

### components/common/ProtectedRoute.tsx

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

interface Props {
  allowedRoles?: Array<'client' | 'freelancer' | 'admin'>
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
```

---

## 7. FORM INTEGRATION PATTERN (React Hook Form + Zod + shadcn)

```typescript
// pages/auth/LoginPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/features/auth/schemas/auth.schema'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export default function LoginPage() {
  const login = useLogin()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginInput) => login.mutate(values)

  // Handle 422 field-level errors from API
  if (login.error) {
    const apiErrors = (login.error as any)?.response?.data?.errors
    apiErrors?.forEach(({ field, message }: { field: string; message: string }) => {
      form.setError(field as keyof LoginInput, { message })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jane@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* password field same pattern */}
        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 8. SOCKET.IO SINGLETON

### lib/socket.ts

```typescript
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:8000', {
      autoConnect: false,
      withCredentials: true,
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  const token = useAuthStore.getState().accessToken
  if (token) s.auth = { token }
  s.connect()
}

export const disconnectSocket = () => getSocket().disconnect()
```

---

## 9. ENV FILE TEMPLATE

```env
# .env.local
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 10. SHADCN/UI COMPONENTS TO INSTALL FOR AUTH MODULE

Run these after `npx shadcn@latest init`:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add tabs
npx shadcn@latest add select
npx shadcn@latest add textarea
```

---

## 11. DEVELOPMENT ORDER (Matches Project Timeline)

### Week 1 – Auth + Shell
1. Project scaffold + all config (tsconfig, vite, tailwind, shadcn init)
2. `lib/axios.ts` with refresh interceptor
3. `stores/auth.store.ts`
4. All auth API functions + Zod schemas
5. All auth TanStack Query hooks (login, register, logout, me, 2FA)
6. Auth pages: Login, Register, ForgotPassword, ResetPassword, VerifyEmail, 2FA
7. AppLayout (sidebar + header shell)
8. ProtectedRoute with role guard
9. Session restore on app boot (call `/me` in root)

### Week 2 – Gigs + Proposals
10. Gig API + hooks + pages (marketplace, create, detail)
11. Proposal submission flow

### Week 3 – Chat + Reviews
12. Socket.IO integration, chat UI
13. Review & rating components

### Week 4 – Payments + Admin
14. Payment flow (Razorpay/Stripe integration)
15. Admin DataGrid tables (MUI X DataGrid)
16. Analytics charts (Recharts)

---

## 12. KEY CONVENTIONS TO FOLLOW

- **Never** store accessToken in localStorage. Memory (Zustand) only. refreshToken stays in HTTP-only cookie.
- **Always** use the query key factory from `constants/queryKeys.ts`.
- **Always** type API responses with `ApiResponse<T>`.
- Pages are thin — they compose feature components. Business logic lives in `features/`.
- Form field errors from 422 responses → use `form.setError()` to map to fields.
- Role-based redirects after login → enforce in `useLogin` hook, not in components.
- Socket connection → open on login, close on logout.
- All dates → Day.js. No raw `new Date()` formatting in JSX.
