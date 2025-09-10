# Messaging System Implementation Guide

This document outlines the steps to implement a full messaging system for instructors and students, moving from the demo version to a production-ready system.

## Current Status ✅

### Completed (Demo Phase)
- ✅ Instructor dashboard layout and navigation
- ✅ Instructor overview page with stats and quick actions
- ✅ Messages UI with thread list and chat interface
- ✅ Demo data showing Direct and Class messaging
- ✅ Real-time message sending (client-side only)
- ✅ Placeholder pages for other instructor features

### URLs Available
- `/instructor/dashboard` - Main instructor overview
- `/instructor/messages` - Messaging interface
- `/instructor/classes` - Class management (placeholder)
- `/instructor/students` - Student management (placeholder)
- `/instructor/analytics` - Performance metrics (placeholder)
- `/instructor/earnings` - Payment tracking (placeholder)
- `/instructor/materials` - Resource management (placeholder)
- `/instructor/settings` - Profile settings (placeholder)

## Next Steps for Production 🚧

### Phase 1: Database Schema
Add messaging tables to Prisma schema:

```prisma
// Add to prisma/schema.prisma

model MessageThread {
  id             String   @id @default(cuid())
  type           ThreadType
  classId        String?   // for class announcements
  createdById    String   // instructor who created
  title          String?   // optional custom title
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  class          Class?           @relation(fields: [classId], references: [id])
  createdBy      User             @relation(fields: [createdById], references: [id])
  participants   MessageParticipant[]
  messages       Message[]

  @@map("message_threads")
}

model MessageParticipant {
  id          String   @id @default(cuid())
  threadId    String
  userId      String
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  muted       Boolean  @default(false)
  lastSeenAt  DateTime @default(now())

  // Relations
  thread      MessageThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id])

  @@unique([threadId, userId])
  @@map("message_participants")
}

model Message {
  id         String   @id @default(cuid())
  threadId   String
  senderId   String
  content    String   @db.Text
  createdAt  DateTime @default(now())
  editedAt   DateTime?
  deletedAt  DateTime?

  // Relations
  thread     MessageThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender     User          @relation(fields: [senderId], references: [id])
  readReceipts MessageReadReceipt[]

  @@map("messages")
}

model MessageReadReceipt {
  id         String   @id @default(cuid())
  messageId  String
  userId     String
  readAt     DateTime @default(now())

  // Relations
  message    Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user       User    @relation(fields: [userId], references: [id])

  @@unique([messageId, userId])
  @@map("message_read_receipts")
}

enum ThreadType {
  DIRECT   // 1:1 conversation
  CLASS    // instructor -> students of specific class
}

// Add to existing User model:
model User {
  // ... existing fields
  
  // Messaging relations
  createdThreads      MessageThread[]
  threadParticipants  MessageParticipant[]
  sentMessages        Message[]
  messageReadReceipts MessageReadReceipt[]
}
```

### Phase 2: Migration Commands
```bash
# Update schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_messaging_system

# Push to production
npx prisma migrate deploy
```

### Phase 3: API Endpoints

Create these API routes:

#### `/app/api/instructor/messages/threads/route.ts`
```typescript
// GET: List all threads for instructor
// POST: Create new thread (direct or class announcement)
```

#### `/app/api/instructor/messages/threads/[threadId]/route.ts`
```typescript
// GET: Get thread details and recent messages
// PUT: Update thread settings
// DELETE: Archive/delete thread
```

#### `/app/api/instructor/messages/threads/[threadId]/messages/route.ts`
```typescript
// GET: List messages with pagination
// POST: Send new message
```

#### `/app/api/instructor/messages/[messageId]/read/route.ts`
```typescript
// POST: Mark message as read
```

#### `/app/api/user/messages/threads/route.ts`
```typescript
// GET: List threads for student
// POST: Reply to existing thread (if authorized)
```

### Phase 4: Real-time Updates (Socket.IO)

#### Server Setup
```typescript
// pages/api/socket/messages.ts (if using Pages Router for Socket.IO)
// Or setup in custom server

io.on('connection', (socket) => {
  socket.on('join-thread', (threadId) => {
    // Verify user is participant
    socket.join(`thread:${threadId}`)
  })
  
  socket.on('send-message', async (data) => {
    // Save to database
    // Broadcast to thread participants
    io.to(`thread:${data.threadId}`).emit('new-message', message)
  })
  
  socket.on('typing-start', (threadId) => {
    socket.to(`thread:${threadId}`).emit('user-typing', {
      userId: socket.userId,
      threadId
    })
  })
})
```

#### Client Integration
```typescript
// In messages page
useEffect(() => {
  const socket = io('/messages')
  
  socket.on('new-message', (message) => {
    setMessages(prev => [...prev, message])
  })
  
  socket.on('user-typing', (data) => {
    // Show typing indicator
  })
  
  return () => socket.disconnect()
}, [])
```

### Phase 5: Authorization & Security

#### RBAC Rules
```typescript
// Middleware for message routes
export async function verifyMessageAccess(userId: string, threadId: string) {
  const participant = await prisma.messageParticipant.findFirst({
    where: { userId, threadId, leftAt: null }
  })
  
  if (!participant) {
    throw new Error('Access denied')
  }
  
  return participant
}

// Instructor-specific checks
export async function canCreateClassThread(instructorId: string, classId: string) {
  const classInstructor = await prisma.classInstructor.findFirst({
    where: { instructorId, classId, isPrimary: true }
  })
  
  return !!classInstructor
}
```

#### Rate Limiting
```typescript
// Using next-rate-limit or similar
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 messages per minute
  message: 'Too many messages sent'
})
```

### Phase 6: Advanced Features

#### Message Search
```typescript
// Add full-text search capability
model Message {
  // ... existing fields
  @@fulltext([content])
}

// API endpoint: /api/messages/search?q=query&threadId=optional
```

#### Attachments
```typescript
model MessageAttachment {
  id        String @id @default(cuid())
  messageId String
  filename  String
  fileUrl   String
  fileSize  Int
  mimeType  String
  
  message   Message @relation(fields: [messageId], references: [id])
}
```

#### Push Notifications
```typescript
// Using service like Pusher, Firebase, or custom WebPush
export async function sendPushNotification(userId: string, message: string) {
  // Implementation depends on chosen service
}
```

## Testing Strategy 🧪

### Unit Tests
- Message creation and validation
- Thread participant management
- Authorization checks

### Integration Tests
- API endpoint functionality
- Real-time message delivery
- Database consistency

### E2E Tests
- Complete messaging flow
- Instructor-student communication
- Class announcements

## Performance Considerations 📈

### Database Optimization
```sql
-- Indexes for message queries
CREATE INDEX idx_messages_thread_created ON messages(thread_id, created_at);
CREATE INDEX idx_participants_user_thread ON message_participants(user_id, thread_id);
CREATE INDEX idx_read_receipts_message_user ON message_read_receipts(message_id, user_id);
```

### Caching Strategy
- Redis for active thread lists
- In-memory cache for frequent queries
- CDN for message attachments

### Pagination
- Cursor-based pagination for messages
- Load more functionality in UI
- Optimize for mobile performance

## Deployment Checklist 🚀

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Socket.IO server running
- [ ] Redis instance available (if using)
- [ ] File storage configured (for attachments)
- [ ] Push notification service setup
- [ ] Rate limiting configured
- [ ] Monitoring and logging enabled
- [ ] Error handling and fallbacks
- [ ] User acceptance testing completed

## Monitoring & Analytics 📊

### Key Metrics
- Messages sent per day/hour
- Active threads count
- Response time (instructor-student)
- User engagement rates
- Error rates and types

### Logging
- Message delivery success/failure
- Authentication errors
- Rate limit violations
- Performance bottlenecks

This implementation guide provides a complete roadmap for moving from the current demo messaging system to a production-ready solution with real-time capabilities, proper security, and scalable architecture.
