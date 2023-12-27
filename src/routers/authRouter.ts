import express from 'express'

import * as controller from '../controllers/authController'

import { isLoggedIn, isLoggedOut } from '../middlewares/authentication'
import rateLimitMiddleware from '../utils/ratelimiter'

import { runValidation } from '../validation/runValidation'
import { userLoginValidation } from '../validation/userValidation'

const router = express.Router()

//GET --> login by email and password
router.post(
  '/login',
  isLoggedOut,
  rateLimitMiddleware,
  userLoginValidation,
  runValidation,
  controller.login
)
//GET --> logout
router.post('/logout', controller.logout)

export default router
