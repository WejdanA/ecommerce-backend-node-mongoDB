import { NextFunction, Request, Response } from 'express'

import { Category, ICategory } from '../models/category'
import * as services from '../services/categoryService'
import ApiError from '../errors/ApiError'
import mongoose from 'mongoose'

// get all categories
export const getAllCategories = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(request.query.limit) || 0
    const page = Number(request.query.page) || 1
    const search = (request.query.search as string) || ''

    const { allCategories, totalPage, currentPage } = await services.findAllCategories(
      page,
      limit,
      search
    )

    response.status(200).json({
      message: `All categories are returned `,

      allCategories,
      totalPage,
      currentPage,
    })
  } catch (error) {
    next(error)
  }
}

// get a specific category
export const getSingleCategory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params

    const category = await services.findCategoryById(id, next)

    response.status(200).json({
      message: `Single category is returned `,
      category,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// delete a specific category
export const deleteCategory = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const category = await services.findAndDeletedCategory(id, next)

    response.status(200).json({
      message: `Category with ID: ${id} is deleted`,
      _id: id,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}

// create a new category
export const createCategory = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const newInput = request.body

    const category = await services.findIfCategoryExist(newInput, next)

    const newCategory: ICategory = new Category({
      name: newInput.name,
    })
    await newCategory.save()

    response.status(201).json({
      message: `New category is created`,
      category: newCategory,
    })
  } catch (error) {
    next(error)
  }
}

// update a specific category
export const updateCategory = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params
    const category = request.body

    const updatedCategory = await services.findAndUpdateCategory(id, next, category)

    response.status(200).json({
      message: `Category with ID: ${id} is updated`,
      updatedCategory,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}
