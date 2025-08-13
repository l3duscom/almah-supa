# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Database setup (first time only)
npm run db:setup

# Run migrations (if available)
npm run db:migrate
```

## Architecture Overview

This is a Next.js 15 application for organizing "Amigo Secreto" (Secret Santa) events using the App Router architecture.

### Tech Stack
- **Next.js 15** with App Router and React Server Components
- **Supabase** for authentication (magic link) and database
- **shadcn/ui** components with Radix UI primitives
- **TailwindCSS** for styling with dark theme
- **Resend** for email notifications
- **TypeScript** with strict configuration

### Folder Structure

```
app/
├── (auth)/                 # Auth route group (bypasses app layout)
│   ├── auth/confirm/      # Magic link confirmation
│   └── login/             # Login page with magic link
├── app/                   # Protected app routes (requires authentication)
│   ├── console/           # Super admin console dashboard (role-protected)
│   ├── debug/             # Debug utilities for development
│   ├── grupos/            # Groups management
│   │   ├── [id]/         # Individual group view
│   │   ├── novo/         # Create new group
│   │   └── page.tsx      # Groups list
│   ├── test-db/          # Database connectivity testing
│   └── layout.tsx        # Protected layout with Header
├── logout/                # Logout functionality
components/
├── ui/                   # shadcn/ui components
└── [form-components]     # Custom form components
lib/
├── auth.ts               # Authentication utilities and role checking
utils/supabase/          # Supabase client configurations
```

### Authentication & Authorization

- Uses Supabase Auth with Google OAuth (primary) and magic link (fallback)
- Authentication middleware in `middleware.ts` protects all routes except static files
- Two client configurations:
  - `utils/supabase/client.ts` - Browser client
  - `utils/supabase/server.ts` - Server-side client with cookie handling
- Protected routes are under `app/app/` with layout that redirects unauthenticated users
- Login options:
  - **Google OAuth**: Primary authentication method using `signInWithGoogle()` server action
  - **Magic Link**: Fallback email-based authentication using `login()` server action

#### Role-Based Access Control (RBAC)

- **User Roles**: `user` (default), `admin`, `super_admin`
- **Role Management**: Stored in `users.role` column, managed via database policies
- **Super Admin Features**:
  - Access to `/app/console` dashboard with enhanced system analytics
  - Can view and manage all users, groups, and participants
  - Real-time statistics with role distribution and completion rates
  - Special "Console" link in header navigation (visible only to super admins)
- **Authentication Utilities** (`lib/auth.ts`):
  - `getCurrentUser()` - Get current user with role information
  - `requireAuth()` - Require authentication for protected routes
  - `requireSuperAdmin()` - Require super admin role, redirect if insufficient
  - `requireAdmin()` - Require admin or super admin role
- **Policy Protection**: Database-level RLS policies prevent unauthorized access, using hardcoded super admin emails to avoid recursion issues

### Database Schema

Based on the code, the database has:
- `groups` table with `name`, `owner_id`, `id`
- `participants` table with `name`, `email`, `group_id`, `assigned_to` (for secret santa assignments)

### Server Actions Pattern

Server Actions are used for form handling:
- `app/(auth)/login/actions.ts` - Authentication actions:
  - `signInWithGoogle()` - Google OAuth authentication
  - `login()` - Magic link authentication
- `app/app/grupos/novo/actions.ts` - Group creation, participant assignment, and email sending

### Key Features

1. **Secret Santa Algorithm**: Implemented in `drawGroup()` function that assigns each participant to another participant
2. **Email Notifications**: Uses Resend to send assignment emails to all participants
3. **Form State Management**: Uses React's `useActionState` for form handling with server actions
4. **Dark Theme**: Default dark theme configured in root layout

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  # Required for migrations only
NEXT_PUBLIC_URL
RESEND_API_KEY
FROM_EMAIL
```

### Database Setup

1. **First Time Setup:**
   ```bash
   npm run db:setup
   ```
   This displays the SQL scripts to run manually in Supabase SQL Editor.

2. **Database Schema:**
   - `users` - User profiles with roles (user, admin, super_admin)
   - `groups` - Secret Santa groups
   - `participants` - Group participants and assignments
   - `_migrations` - Migration tracking (auto-created)

3. **Super Admin Creation:**
   - Create user in Supabase Auth (any email)
   - Update role manually: `UPDATE public.users SET role = 'super_admin' WHERE email = 'your-email@domain.com';`
   - Configured super admin emails: `ledusdigital@gmail.com`, `admin@almah-supa.com`
   - Super admins can view/manage all groups and users via `/app/console` dashboard

4. **Database Policies (Fixed for Recursion):**
   - RLS policies use `auth.email()` checks instead of recursive `users` table lookups
   - Super admin access hardcoded for specific emails to avoid infinite recursion
   - Service role bypass available for administrative operations

5. **Migration Files:**
   - `lib/db/migrations/` - Database schema migrations (fixed policies)
   - `lib/db/seeders/` - Database seeders
   - `scripts/migrate.ts` - Migration runner (advanced)
   - `scripts/migrate-simple.ts` - Manual setup guide

6. **Development/Debug Routes:**
   - `/app/debug` - View current user authentication status and role
   - `/app/test-db` - Test database connectivity and table access
   - `/logout` - Sign out and redirect to login

### Component Library Setup

- shadcn/ui configured with gray base color and CSS variables
- Icons from Lucide React
- Path aliases: `@/` maps to project root
- Components path: `@/components`
- Utils path: `@/lib/utils`