import { rateLimit } from 'express-rate-limit'

// Rate limit middleware
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {msg:'Exceeded login attempts. Please try again in minute '},
  headers: true,
})

export default rateLimitMiddleware
