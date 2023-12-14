import { NextFunction, Request, Response } from 'express'

import { dev } from '../config'
import * as services from '../services/authService'
import setCookieResponse from '../utils/cookiesRes'
import { generateToken } from '../utils/tokenHandle'

// login authenticaiton
export const login = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body

    const user = await services.isEmailMatch(email)
    await services.isPasswordMatch(user, password)
    services.isUserBanned(user)

    const accessToken = generateToken({ _id: user.id }, dev.app.jwtAccessKey, '15m')
    setCookieResponse(response, accessToken)

    response
      .status(200)
      .json({ message: `you logged in ${user.isAdmin ? 'as an Admin' : ''}`, user })
  } catch (error) {
    next(error)
  }
}

// logout authenticaiton
export const logout = async (request: Request, response: Response, next: NextFunction) => {
  try {
    response.status(200).clearCookie('access_token')
    response.status(200).json({ message: 'you logged out ' })
  } catch (error) {
    next(error)
  }
}
