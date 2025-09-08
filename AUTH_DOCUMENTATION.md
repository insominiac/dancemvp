# Authentication & Authorization Documentation

## Overview

This application implements a role-based access control (RBAC) system with three user roles:
- **ADMIN**: Full access to all resources and operations
- **INSTRUCTOR**: Limited access to manage their classes and view student information
- **USER**: Standard user access (students)

## Admin Permissions

**Admins have FULL CRUD permissions for all resources:**
- ✅ Create, Read, Update, Delete all users
- ✅ Create, Read, Update, Delete all classes
- ✅ Create, Read, Update, Delete all events
- ✅ Create, Read, Update, Delete all bookings
- ✅ Create, Read, Update, Delete all venues
- ✅ Create, Read, Update, Delete all dance styles
- ✅ Create, Read, Update, Delete all transactions
- ✅ Access to all admin panel features
- ✅ View all statistics and analytics

## Implementation Details

### 1. Middleware Protection (`/middleware.ts`)
- Protects all `/admin` and `/api/admin` routes
- Checks for authentication token in cookies or Authorization header
- In development mode, allows mock admin access
- In production mode, requires valid JWT token with admin role

### 2. Authentication Utility (`/app/lib/auth.ts`)
Key functions:
- `getCurrentUser()`: Gets current authenticated user
- `requireAdmin()`: Ensures user is authenticated and has admin role
- `isAdmin()`: Checks if user has admin role
- `hasPermission()`: Checks specific permissions for resources

### 3. API Wrapper (`/app/lib/admin-api-wrapper.ts`)
- `withAdminAuth()`: Wrapper function for admin API routes
- Automatically handles authentication and authorization
- Provides consistent error responses

## Development Mode

In development mode, the system provides automatic admin access:

### Mock Admin User
- Email: `admin@dev.local`
- Password: `admin123`
- Role: `ADMIN`

### Automatic Admin Access
When `NODE_ENV=development` and no authentication token is present:
- Middleware allows access to admin routes
- Auth utility returns mock admin user
- Console logs indicate development mode access

## API Authentication

### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dev.local",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "admin@dev.local",
    "fullName": "Development Admin",
    "role": "ADMIN"
  },
  "token": "jwt-token"
}
```

### Logout Endpoint
```http
POST /api/auth/logout
```

## Protected API Routes

All admin API routes are protected and require admin authentication:

### Example: Users API
```typescript
// Without wrapper (manual check)
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request)
  // ... handle request
}

// With wrapper (automatic check)
export const GET = withAdminAuth(async (request, { user }) => {
  // user is already authenticated admin
  // ... handle request
})
```

## Error Responses

### Authentication Required (401)
```json
{
  "error": "Authentication required"
}
```

### Insufficient Permissions (403)
```json
{
  "error": "Admin privileges required"
}
```

## Security Features

1. **Password Hashing**: Uses bcryptjs for secure password storage
2. **JWT Tokens**: Stateless authentication with expiry
3. **HTTP-Only Cookies**: Prevents XSS attacks
4. **Role Verification**: Double-checks role in both middleware and API routes
5. **Cascade Protection**: Related records are protected through database constraints

## Future Enhancements

When NextAuth.js is implemented:
1. Replace current auth system with NextAuth providers
2. Add OAuth providers (Google, GitHub, etc.)
3. Implement refresh tokens
4. Add two-factor authentication
5. Enhanced session management

## Testing Authentication

### Using cURL
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dev.local","password":"admin123"}'

# Access admin API with token
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### In Development
The system automatically provides admin access in development mode, so you can access:
- Admin Panel: http://localhost:3000/admin
- Admin APIs: http://localhost:3000/api/admin/*

No login required in development mode!
