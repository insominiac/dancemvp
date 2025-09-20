import { z } from 'zod'

// CUID validation regex
const CUID_REGEX = /^c[^\s-]{8,}$/

// Reusable CUID validation schema
export const cuidSchema = z.string().regex(CUID_REGEX, 'Invalid ID format')

// Specific validation schemas
export const instructorIdSchema = cuidSchema
export const userIdSchema = cuidSchema
export const classIdSchema = cuidSchema
export const eventIdSchema = cuidSchema
export const bookingIdSchema = cuidSchema
export const venueIdSchema = cuidSchema

// Optional CUID schema for nullable fields
export const optionalCuidSchema = z.string().regex(CUID_REGEX, 'Invalid ID format').optional()