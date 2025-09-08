# Dance Platform API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Currently using session-based authentication (to be implemented).
All admin routes require authentication.

## API Endpoints

### 📊 Statistics API

#### Get Dashboard Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalClasses": 25,
    "totalEvents": 10,
    "totalBookings": 300,
    "totalVenues": 5,
    "totalInstructors": 12,
    "confirmedBookings": 250,
    "totalTransactions": 300,
    "totalForumPosts": 45,
    "totalTestimonials": 30,
    "totalDanceStyles": 15,
    "totalRevenue": 15000,
    "unreadNotifications": 5,
    "activePartnerRequests": 8,
    "unreadMessages": 3,
    "userBreakdown": {
      "admins": 2,
      "instructors": 12,
      "students": 136
    }
  }
}
```

---

### 👥 Users API

#### List All Users
```http
GET /api/admin/users
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Student",
      "phoneNumber": "+1234567890",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "instructor": null,
      "_count": {
        "bookings": 5,
        "transactions": 5
      }
    }
  ]
}
```

#### Create User
```http
POST /api/admin/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "Jane Smith",
  "role": "Student",
  "phoneNumber": "+1234567890"
}
```

#### Update User
```http
PUT /api/admin/users/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "Instructor",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/admin/users/{id}
```

---

### 📚 Classes API

#### List All Classes
```http
GET /api/admin/classes
```

**Response:**
```json
{
  "classes": [
    {
      "id": "uuid",
      "title": "Beginner Ballet",
      "description": "Introduction to ballet",
      "level": "Beginner",
      "duration": 60,
      "price": "50.00",
      "maxStudents": 20,
      "currentStudents": 15,
      "schedule": "Monday 6PM",
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "venueId": "venue-uuid",
      "status": "ACTIVE",
      "venue": { "name": "Main Studio" },
      "classInstructors": [],
      "classStyles": [],
      "_count": { "bookings": 15 }
    }
  ]
}
```

#### Create Class
```http
POST /api/admin/classes
Content-Type: application/json

{
  "title": "Advanced Jazz",
  "description": "Advanced jazz techniques",
  "level": "Advanced",
  "duration": "90",
  "price": "75",
  "maxStudents": "15",
  "schedule": "Tuesday 7PM",
  "startDate": "2024-02-01",
  "endDate": "2024-04-30",
  "venueId": "venue-uuid",
  "status": "ACTIVE",
  "instructorIds": ["instructor-uuid"],
  "styleIds": ["style-uuid"]
}
```

---

### 🎉 Events API

#### List All Events
```http
GET /api/admin/events
```

#### Create Event
```http
POST /api/admin/events
Content-Type: application/json

{
  "title": "Summer Dance Workshop",
  "description": "Intensive summer workshop",
  "eventType": "Workshop",
  "startDate": "2024-07-01",
  "endDate": "2024-07-03",
  "startTime": "09:00",
  "endTime": "17:00",
  "venueId": "venue-uuid",
  "price": "200",
  "maxAttendees": "50",
  "status": "PUBLISHED",
  "isFeatured": true,
  "styleIds": ["style-uuid1", "style-uuid2"]
}
```

---

### 🎫 Bookings API

#### List All Bookings
```http
GET /api/admin/bookings
```

**Query Parameters:**
- `status` - Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `type` - Filter by type (Class, Event)

#### Create Booking
```http
POST /api/admin/bookings
Content-Type: application/json

{
  "userId": "user-uuid",
  "classId": "class-uuid",  // OR eventId for events
  "bookingType": "Class",
  "status": "PENDING",
  "amount": "50",
  "notes": "Special requirements"
}
```

---

### 🏢 Venues API

#### List All Venues
```http
GET /api/admin/venues
```

#### Create Venue
```http
POST /api/admin/venues
Content-Type: application/json

{
  "name": "Downtown Dance Studio",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "phone": "+1234567890",
  "email": "venue@example.com",
  "capacity": "100",
  "amenities": ["Mirrors", "Sound System", "Parking"],
  "isActive": true
}
```

---

### 💃 Dance Styles API

#### List All Styles
```http
GET /api/admin/dance-styles
```

#### Create Style
```http
POST /api/admin/dance-styles
Content-Type: application/json

{
  "name": "Contemporary",
  "category": "Modern",
  "description": "Contemporary dance style",
  "difficulty": "Intermediate",
  "isActive": true
}
```

---

### 🎓 Instructors API

#### List All Instructors
```http
GET /api/admin/instructors
```

#### Create Instructor Profile
```http
POST /api/admin/instructors
Content-Type: application/json

{
  "userId": "user-uuid",
  "bio": "Experienced dance instructor",
  "experience": "5",
  "specialties": ["Ballet", "Jazz"],
  "certifications": ["RAD Certified", "ISTD Diploma"],
  "hourlyRate": "75",
  "isAvailable": true,
  "profileImageUrl": "https://example.com/image.jpg"
}
```

---

### 💰 Transactions API

#### List All Transactions
```http
GET /api/admin/transactions
```

**Query Parameters:**
- `status` - PENDING, COMPLETED, FAILED, REFUNDED
- `type` - Payment, Refund, Adjustment
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)

#### Create Transaction
```http
POST /api/admin/transactions
Content-Type: application/json

{
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "amount": "50",
  "type": "Payment",
  "status": "COMPLETED",
  "paymentMethod": "Card",
  "referenceNumber": "TXN123456",
  "description": "Class payment"
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Data Types

### User Roles
- `Admin` - Full system access
- `Instructor` - Teaching privileges  
- `Student` - Default user role

### Class Levels
- `Beginner`
- `Intermediate`
- `Advanced`
- `All Levels`

### Class Status
- `ACTIVE` - Currently running
- `COMPLETED` - Finished
- `CANCELLED` - Cancelled

### Event Types
- `Workshop`
- `Competition`
- `Showcase`
- `Social`
- `Masterclass`

### Event Status
- `DRAFT` - Not published
- `PUBLISHED` - Live and bookable
- `CANCELLED` - Cancelled

### Booking Status
- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed booking
- `CANCELLED` - Cancelled by user/admin
- `COMPLETED` - Class/event completed

### Transaction Types
- `Payment` - Payment received
- `Refund` - Refund issued
- `Adjustment` - Manual adjustment

### Transaction Status
- `PENDING` - Processing
- `COMPLETED` - Successful
- `FAILED` - Failed transaction
- `REFUNDED` - Refunded

### Payment Methods
- `Card` - Credit/Debit card
- `PayPal` - PayPal payment
- `Bank` - Bank transfer
- `Cash` - Cash payment
- `Other` - Other methods

---

## Rate Limiting

API endpoints are rate limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Headers:**
```
X-Total-Count: 150
X-Page-Count: 15
```

---

## Sorting

List endpoints support sorting:

**Query Parameter:**
- `sort` - Field to sort by (prefix with `-` for descending)

Examples:
- `?sort=createdAt` - Sort by creation date (ascending)
- `?sort=-price` - Sort by price (descending)

---

## Filtering

List endpoints support filtering:

**Query Parameters:**
- Use field names as parameters
- Support for exact match and range queries

Examples:
- `?status=ACTIVE` - Filter by status
- `?price[gte]=50&price[lte]=100` - Price range
- `?createdAt[gte]=2024-01-01` - Created after date

---

## Webhooks (Future)

Webhook events will be sent for:
- User registration
- Booking confirmation
- Payment completion
- Class cancellation

---

## Version History

- **v1.0.0** - Initial API release (December 2024)

---

**Note**: This API is under active development. Some endpoints may change.
