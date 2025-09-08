import Redis from 'ioredis'

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

// Cache utility functions
export const cache = {
  // Get cached data
  async get(key: string) {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  },

  // Set cache with TTL
  async set(key: string, value: any, ttl = 300) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  },

  // Delete cache
  async del(key: string) {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  },

  // Clear pattern
  async clearPattern(pattern: string) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Redis clear pattern error:', error)
      return false
    }
  },

  // Check if key exists
  async exists(key: string) {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  },

  // Get TTL
  async ttl(key: string) {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error('Redis TTL error:', error)
      return -1
    }
  }
}

// Session management
export const session = {
  // Store session
  async set(sessionId: string, data: any, ttl = 3600) {
    return cache.set(`session:${sessionId}`, data, ttl)
  },

  // Get session
  async get(sessionId: string) {
    return cache.get(`session:${sessionId}`)
  },

  // Delete session
  async del(sessionId: string) {
    return cache.del(`session:${sessionId}`)
  },

  // Extend session
  async extend(sessionId: string, ttl = 3600) {
    try {
      await redis.expire(`session:${sessionId}`, ttl)
      return true
    } catch (error) {
      console.error('Session extend error:', error)
      return false
    }
  }
}

// Rate limiting
export const rateLimit = {
  // Check rate limit
  async check(identifier: string, limit = 100, window = 60) {
    const key = `rate:${identifier}`
    try {
      const current = await redis.incr(key)
      if (current === 1) {
        await redis.expire(key, window)
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        reset: await redis.ttl(key)
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      return { allowed: true, remaining: limit, reset: window }
    }
  }
}

export default redis
