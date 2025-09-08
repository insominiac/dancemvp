# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Workflow
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio to browse database
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Database Scripts (in /scripts directory)
```bash
# Verify database connection and tables
node scripts/verify-database.js

# List all tables and counts
node scripts/list-tables.js

# Backup database data
node scripts/backup-data.js

# Fetch all data from database
node scripts/fetch-all-data.js
```

### Testing (to be implemented)
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL (hosted on Railway)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: bcryptjs (NextAuth.js to be implemented)
- **Language**: TypeScript
- **Deployment**: Vercel

### Database Architecture
The platform uses 20 interconnected tables:

**Core Entities:**
- `users` - Central user table with role-based access (Admin, Instructor, Student)
- `classes` - Dance classes with schedules and pricing
- `events` - Special events and workshops
- `bookings` - Tracks class/event registrations
- `venues` - Physical locations for classes/events
- `transactions` - Payment records and financial tracking

**Relationship Tables:**
- Many-to-many relationships managed through junction tables (classInstructors, classStyles, eventStyles)
- Cascade deletions configured for data integrity

### Project Structure
```
/app
  /admin          - Admin panel with full CRUD operations
    /sections     - Individual management components
  /api            - REST API endpoints
    /admin        - Protected admin endpoints
  /(public)       - Public-facing pages (in development)
  /lib            - Shared utilities and database client
/prisma           - Database schema and migrations
/scripts          - Database utility scripts
```

### API Pattern
All admin APIs follow RESTful conventions:
- `GET /api/admin/{entity}` - List all
- `POST /api/admin/{entity}` - Create new
- `PUT /api/admin/{entity}/[id]` - Update
- `DELETE /api/admin/{entity}/[id]` - Delete

### Authentication Flow (To Be Implemented)
The roadmap indicates NextAuth.js will be implemented with:
- Session-based authentication
- Role-based access control (RBAC)
- Protected routes via middleware

## Current Development Status

### Completed ✅
- Full database schema (20 tables)
- Admin panel with CRUD operations for all entities
- API routes for core functionality
- Statistics dashboard
- Basic UI components with Tailwind CSS

### In Progress 🚧
- Authentication system (NextAuth.js)
- Public website pages
- Payment integration (Stripe)
- Email notifications
- User dashboard

### Key Files to Understand

1. **Database Schema**: `/prisma/schema.prisma`
   - Defines all 20 tables and relationships
   - Uses PostgreSQL with Prisma ORM

2. **Admin Panel**: `/app/admin/page.tsx`
   - Central hub for all administrative functions
   - 15 management sections

3. **API Routes**: `/app/api/admin/*`
   - RESTful endpoints for all entities
   - Currently unprotected (auth pending)

4. **Database Connection**: `/app/lib/db.ts`
   - Prisma client singleton
   - Handles connection pooling

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://[connection_string]
```

Future additions (per vercel.json):
```
REDIS_URL=[redis_connection]
JWT_SECRET=[secret]
STRIPE_SECRET_KEY=[stripe_key]
NEXTAUTH_SECRET=[auth_secret]
```

## Development Priorities

Per ROADMAP.md, the immediate priorities are:
1. **Authentication** - Implement NextAuth.js with role-based access
2. **Public Website** - Create user-facing pages for classes/events
3. **Payment Processing** - Integrate Stripe for bookings
4. **User Dashboard** - Build customer portal

## Database Connection

The project uses a PostgreSQL database hosted on Railway. The connection string in `.env` points to:
- Host: interchange.proxy.rlwy.net
- Port: 18791
- Database: railway

## API Documentation

Detailed API documentation is available in `API_DOCUMENTATION.md`. Key endpoints include:
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/classes` - Class management
- `/api/admin/events` - Event management
- `/api/admin/bookings` - Booking management

## Deployment

The project is configured for Vercel deployment (`vercel.json`):
- Build command: `npm run build`
- Output directory: `.next`
- Region: `iad1`
- API functions have 30-second timeout
- Includes cron job configuration for cleanup tasks

## Common Development Tasks

### Adding a New Database Table
1. Update `/prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push` (development) or create migration
4. Create API routes in `/app/api/admin/[entity]`
5. Add management component in `/app/admin/sections`
6. Update admin panel navigation

### Creating a New API Endpoint
1. Create route file in `/app/api/admin/[entity]/route.ts`
2. Implement GET, POST, PUT, DELETE methods as needed
3. Use Prisma client from `/app/lib/db.ts`
4. Add error handling and validation

### Adding a Public Page
1. Create page in `/app/(public)/[page]/page.tsx`
2. Use the public layout at `/app/(public)/layout.tsx`
3. Implement responsive design with Tailwind CSS
4. Connect to API endpoints for data fetching
