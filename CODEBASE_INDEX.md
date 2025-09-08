# Dance Platform - Complete Codebase Index

## 📁 Project Structure Overview

```
dance-platform/
├── app/                      # Next.js 14 App Directory
│   ├── admin/               # Admin Panel
│   ├── api/                 # API Routes
│   ├── components/          # Shared Components
│   ├── lib/                 # Utilities & Database
│   └── page.tsx            # Landing Page
├── prisma/                  # Database Schema
├── public/                  # Static Assets
└── config files            # Configuration
```

## 🗄️ Database Schema (20 Tables)

### Core Tables
1. **users** - User accounts with RBAC
2. **instructors** - Instructor profiles
3. **classes** - Dance classes
4. **events** - Dance events
5. **bookings** - Class/event bookings
6. **venues** - Venue locations
7. **danceStyles** - Dance style categories
8. **transactions** - Payment records

### Relationship Tables
9. **classInstructors** - Class-instructor mapping
10. **classStyles** - Class-style mapping
11. **eventStyles** - Event-style mapping
12. **instructorStyles** - Instructor-style mapping

### Community Tables
13. **forumPosts** - Forum discussions
14. **forumReplies** - Forum responses
15. **testimonials** - User reviews
16. **partnerMatches** - Dance partner connections
17. **partnerRequests** - Partner match requests

### System Tables
18. **notifications** - User notifications
19. **contactMessages** - Contact form submissions
20. **auditLogs** - System activity logs

## 🎨 Frontend Components

### Admin Panel Components (`/app/admin/sections/`)

#### Full CRUD Implementation
- `UserManagement.tsx` - Complete user CRUD with role management
- `ClassManagement.tsx` - Class scheduling and management
- `EventManagement.tsx` - Event creation and management
- `BookingManagement.tsx` - Booking system with status tracking
- `VenueManagement.tsx` - Venue management with amenities
- `DanceStyleManagement.tsx` - Dance style categorization
- `InstructorManagement.tsx` - Instructor profile management
- `TransactionAnalytics.tsx` - Payment tracking and analytics

#### Placeholder Components
- `ForumModeration.tsx` - Forum content moderation
- `NotificationCenter.tsx` - Notification management
- `DashboardOverview.tsx` - Admin dashboard overview

### Main Admin Component (`/app/admin/page.tsx`)
- Central admin panel with navigation
- 15 sections covering all database entities
- Real-time statistics and badge counters
- Responsive sidebar navigation

## 🔌 API Routes (`/app/api/admin/`)

### Statistics & Helpers
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/helpers` - Helper data for forms

### User Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Class Management
- `GET /api/admin/classes` - List all classes
- `POST /api/admin/classes` - Create new class
- `PUT /api/admin/classes/[id]` - Update class
- `DELETE /api/admin/classes/[id]` - Delete class

### Event Management
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

### Booking Management
- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/bookings` - Create new booking
- `PUT /api/admin/bookings/[id]` - Update booking
- `DELETE /api/admin/bookings/[id]` - Delete booking

### Venue Management
- `GET /api/admin/venues` - List all venues
- `POST /api/admin/venues` - Create new venue
- `PUT /api/admin/venues/[id]` - Update venue
- `DELETE /api/admin/venues/[id]` - Delete venue

### Dance Style Management
- `GET /api/admin/dance-styles` - List all styles
- `POST /api/admin/dance-styles` - Create new style
- `PUT /api/admin/dance-styles/[id]` - Update style
- `DELETE /api/admin/dance-styles/[id]` - Delete style

### Instructor Management
- `GET /api/admin/instructors` - List all instructors
- `POST /api/admin/instructors` - Create instructor profile
- `PUT /api/admin/instructors/[id]` - Update instructor
- `DELETE /api/admin/instructors/[id]` - Delete instructor

### Transaction Management
- `GET /api/admin/transactions` - List all transactions
- `POST /api/admin/transactions` - Create transaction
- `PUT /api/admin/transactions/[id]` - Update transaction
- `DELETE /api/admin/transactions/[id]` - Delete transaction

## 🛠️ Core Libraries & Configuration

### Database (`/app/lib/db.ts`)
```typescript
- Prisma Client singleton
- PostgreSQL connection (Railway)
- Connection pooling
```

### Dependencies
- **Next.js 14** - React framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database (Railway hosted)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing

## 🔐 Authentication & Security

### User Roles
- `Admin` - Full system access
- `Instructor` - Teaching privileges
- `Student` - Default user role

### Security Features
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Audit logging for all actions
- Secure API endpoints

## 📊 Key Features

### Admin Dashboard
- Real-time statistics
- User breakdown by role
- Revenue tracking
- Booking analytics
- Quick action buttons

### Data Management
- Full CRUD for all major entities
- Relationship management (many-to-many)
- Cascade deletions with safety checks
- Data validation

### User Experience
- Responsive design
- Loading states
- Error handling
- Confirmation dialogs
- Modal forms
- Filter and search capabilities

## 🗺️ Navigation Structure

```
Admin Panel
├── Dashboard (Overview)
├── Users Management
├── Instructors Management
├── Classes Management
├── Events Management
├── Bookings Management
├── Venues Management
├── Dance Styles Management
├── Transactions Analytics
├── Forum Moderation
├── Testimonials Management
├── Partner Matching System
├── Notifications Center
├── Contact Messages
└── Audit Logs
```

## 📈 Database Relationships

### User Relations
- User → Instructor (1:1)
- User → Bookings (1:many)
- User → Transactions (1:many)
- User → Forum Posts (1:many)

### Class Relations
- Class → Instructors (many:many)
- Class → Dance Styles (many:many)
- Class → Bookings (1:many)
- Class → Venue (many:1)

### Event Relations
- Event → Venue (many:1)
- Event → Dance Styles (many:many)
- Event → Bookings (1:many)

### Booking Relations
- Booking → User (many:1)
- Booking → Class/Event (many:1)
- Booking → Transaction (1:1)

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://..."  # Railway PostgreSQL URL
```

## 🎯 Project Status

### ✅ Completed
- Database schema (20 tables)
- Admin panel UI
- Full CRUD for 8 major entities
- API routes for all CRUD operations
- Real-time data fetching
- Transaction analytics
- User role management

### 🚧 In Progress
- Forum moderation features
- Notification system
- Testimonial approval workflow
- Partner matching algorithm
- Contact message responses
- Audit log viewer

### 📋 Future Enhancements
- Email notifications
- Advanced search/filtering
- Bulk operations
- Data export/import
- Advanced analytics
- Mobile app API
- Payment gateway integration
- Real-time updates (WebSocket)

## 📞 Support

For questions or issues, refer to:
- Database schema: `/prisma/schema.prisma`
- API documentation: `/app/api/admin/`
- Component documentation: `/app/admin/sections/`

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Database**: PostgreSQL (Railway)
**Framework**: Next.js 14 with App Router
