import { Server as HTTPServer } from 'http'
import { Socket, Server } from 'socket.io'
import { cache } from './redis'

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
      credentials: true
    }
  })

  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (token) {
      // Verify token and get user
      const user = await cache.get(`auth:${token}`)
      if (user) {
        socket.data.user = user
        next()
      } else {
        next(new Error('Invalid token'))
      }
    } else {
      next() // Allow anonymous connections
    }
  })

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id)
    
    // Join user-specific room if authenticated
    if (socket.data.user) {
      socket.join(`user:${socket.data.user.id}`)
      socket.join(`role:${socket.data.user.role}`)
    }

    // Join class room for live updates
    socket.on('join:class', (classId: string) => {
      socket.join(`class:${classId}`)
      socket.emit('joined:class', { classId })
    })

    // Join event room
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`)
      socket.emit('joined:event', { eventId })
    })

    // Handle booking updates
    socket.on('booking:create', async (data) => {
      // Emit to instructor
      io.to(`user:${data.instructorId}`).emit('booking:new', {
        ...data,
        timestamp: new Date()
      })
      
      // Emit to admin rooms
      io.to('role:ADMIN').emit('booking:new', data)
      
      // Update class availability
      io.to(`class:${data.classId}`).emit('class:spotsUpdate', {
        classId: data.classId,
        availableSpots: data.availableSpots
      })
    })

    // Handle class updates
    socket.on('class:update', async (data) => {
      // Clear cache
      await cache.clearPattern(`classes:*`)
      
      // Emit to all interested parties
      io.to(`class:${data.id}`).emit('class:updated', data)
      io.emit('classes:refresh') // Tell all clients to refresh
    })

    // Handle real-time notifications
    socket.on('notification:send', (data) => {
      if (data.userId) {
        io.to(`user:${data.userId}`).emit('notification:new', {
          ...data,
          timestamp: new Date()
        })
      } else if (data.role) {
        io.to(`role:${data.role}`).emit('notification:new', data)
      }
    })

    // Handle chat messages (for class discussions)
    socket.on('chat:message', async (data) => {
      const message = {
        ...data,
        userId: socket.data.user?.id,
        userName: socket.data.user?.fullName,
        timestamp: new Date()
      }
      
      // Store in cache for history
      const key = `chat:${data.classId}`
      const messages = await cache.get(key) || []
      messages.push(message)
      if (messages.length > 100) messages.shift() // Keep last 100
      await cache.set(key, messages, 3600) // 1 hour TTL
      
      // Emit to class room
      io.to(`class:${data.classId}`).emit('chat:newMessage', message)
    })

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      socket.to(`class:${data.classId}`).emit('chat:userTyping', {
        userId: socket.data.user?.id,
        userName: socket.data.user?.fullName
      })
    })

    // Handle presence
    socket.on('presence:update', (status) => {
      if (socket.data.user) {
        io.emit('presence:userStatus', {
          userId: socket.data.user.id,
          status
        })
      }
    })

    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      if (socket.data.user) {
        io.emit('presence:userStatus', {
          userId: socket.data.user.id,
          status: 'offline'
        })
      }
    })
  })

  return io
}

// Emit events from outside socket handlers
export function emitToRoom(io: Server, room: string, event: string, data: any) {
  io.to(room).emit(event, data)
}

export function emitToUser(io: Server, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data)
}

export function broadcast(io: Server, event: string, data: any) {
  io.emit(event, data)
}
