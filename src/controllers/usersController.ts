import { NextFunction, Request, Response } from 'express'
import { JwtPayload, TokenExpiredError } from 'jsonwebtoken'
import mongoose, { SortOrder } from 'mongoose'

import { dev } from '../config'
import ApiError from '../errors/ApiError'
import * as services from '../services/userService'
import { sendEmail } from '../utils/sendEmail'
import { generateToken, verifyToken } from '../utils/tokenHandle'

interface CustomeRequest extends Request {
  userId?: string
}

// get all users
export const getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const limit = Number(request.query.limit) || 0
    const page = Number(request.query.page) || 1
    const sort = request.query.sort as SortOrder
    const search = (request.query.search as string) || ''
    const isAdmin = request.query.isAdmin as string
    const isBanned = request.query.isBanned as string

    const { allUsers, totalPage, currentPage } = await services.findAllUsers(
      page,
      limit,
      search,
      sort,
      isAdmin,
      isBanned
    )

    if (allUsers.length) {
      return response.status(200).json({
        message: 'users were found',
        allUsers,
        totalPage,
        currentPage,
      })
    }

    return response.status(200).json({
      message: 'there are no matching results',
    })
  } catch (error) {
    next(error)
  }
}

// get a sing user
export const getSingleUser = async (
  request: CustomeRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = request.userId

    const user = await services.findSingleUser({ _id: id })

    response.status(200).json({ message: 'User was found', user })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// register a new user
export const registUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = request.body
    const registedUser = request.body

    if (registedUser.isBanned || registedUser.isAdmin) {
      throw ApiError.badRequest(403, 'you do not have permission to ban user or modify its role')
    }

    await services.findIfUserEmailExist(email)
    const token: string = generateToken(registedUser, dev.app.jwtUserActivationKey, '2m')

    // prepare and send email to verify user
    const emailData = {
      email: email,
      subject: 'Activate your account',
      html: ` 
    <h1> Hello</h1>
    <p>Please activate your account by <a href= "http://localhost:3000/users/activate?token=${token}">click here</a></p>`,
    }
    sendEmail(emailData)

    response.status(200).json({ message: 'Check your email to activate the account ', token })
  } catch (error) {
    next(error)
  }
}

// activate and create user
export const activateUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { token } = request.body

    const decodedUser = verifyToken(token, dev.app.jwtUserActivationKey) as JwtPayload
    const user = await services.createUser(decodedUser)

    response.status(201).json({ message: `User with id: ${user.id} was created` })
  } catch (error) {
    next(error)
  }
}

// update user profile
export const updateUser = async (
  request: CustomeRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const id = request.userId
    const { email } = request.body
    const updatedUser = request.body

    if (updatedUser.isBanned || updatedUser.isAdmin || updatedUser.password) {
      throw ApiError.badRequest(
        403,
        'you do not have permission to ban users or modify thier role and password'
      )
    }

    await services.findIfUserEmailExist(email, id)
    const user = await services.findUserAndUpdate({ _id: id }, updatedUser)

    response.status(200).json({ message: `User with id: ${user.id} was updated` })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// block a specific user
export const banUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const user = await services.updateBanStatusById(id, true)

    response.status(200).json({ message: `User with id: ${user.id} was banned` })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// unblock a specific user
export const unBanUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const user = await services.updateBanStatusById(id, false)

    response.status(200).json({ message: `User with id: ${user.id} was Unbanned` })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// upgrade a specific user to an admin
export const upgradeUserRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const user = await services.updateUserRoleById(id, true)

    response.status(200).json({ message: 'admin permession was granted' })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// downgrade a specific admin to a regular user
export const downgradeUserRole = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params

    const user = await services.updateUserRoleById(id, false)

    response.status(200).json({ message: 'admin permession was removed' })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// delete a specific user
export const deleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const user = await services.findAndDeleteUser(id)

    response.status(204).json({ message: `User with id: ${id} deleted` })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, 'ID format is Invalid must be 24 characters'))
    } else {
      next(error)
    }
  }
}

// send email to reset user password
export const forgetPassword = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = request.body

    const user = await services.findSingleUser({ email })

    const token = generateToken({ email }, dev.app.jwtResetKey, '2m')

    const emailData = {
      email: email,
      subject: 'Reset The password',
      html: ` 
    <h1> Hello${user.firstName}</h1>
    <p>Please reset the password by <a href= "http://127.0.0.1:8080/users/reset/${token}">click here</a></p>`,
    }
    sendEmail(emailData)

    response.status(200).json({ message: 'Check your email to reset the password ', token })
  } catch (error) {
    next(error)
  }
}

// verify token and update user password
export const resetPassword = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token = request.body.token
    const password = request.body.password

    const decodedData = verifyToken(token, dev.app.jwtResetKey) as JwtPayload

    const updatedUser = await services.findUserAndUpdate(
      { email: decodedData.email },
      { $set: { password: password } }
    )

    response.status(200).json({ message: 'The password was updated successfully' })
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(ApiError.badRequest(401, 'Token was expired'))
    } else {
      next(error)
    }
  }
}
