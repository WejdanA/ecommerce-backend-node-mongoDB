import { NextFunction } from 'express'

import ApiError from '../errors/ApiError'
import { ICategory, Category } from '../models/category'

// return all Categories using pagination
export const findAllCategories = async (page: number, limit: number, search: string) => {
  //how many have categories
  const countPage = await Category.countDocuments()
  //total page
  const totalPage = limit ? Math.ceil(countPage / limit) : 1
  if (page > totalPage) {
    page = totalPage
  }
  const skip = (page - 1) * limit

  const allCategories: ICategory[] = await Category.find().skip(skip).limit(limit)
  return {
    allCategories,
    totalPage,
    currentPage: page,
  }
}
// find category by id
export const findCategoryById = async (id: string, next: NextFunction) => {
  const singleCategory = await Category.findOne({ _id: id })
  if (!singleCategory) {
    next(ApiError.badRequest(404, `Category is not found with this id: ${id}`))
    return
  }
  return singleCategory
}
// find and delete category by id
export const findAndDeletedCategory = async (id: string, next: NextFunction) => {
  const deleteSingleCategory = await Category.findOneAndDelete({ _id: id })
  if (!deleteSingleCategory) {
    next(ApiError.badRequest(404, `Category is not found with this id: ${id}`))
    return
  }
  return deleteSingleCategory
}
//check entered category is exist on DB or not when a create new category
export const findIfCategoryExist = async (newInput: ICategory, next: NextFunction) => {
  const name = newInput.name
  const categoryExist = await Category.exists({ name: name })
  if (categoryExist) {
    return next(ApiError.badRequest(409, `Category already exist with this Name: ${name}`))
  }
  return categoryExist
}
// find and update category by id
export const findAndUpdateCategory = async (
  id: string,
  next: NextFunction,
  updatedProduct: Request
) => {
  const categoryUpdated = await Category.findOneAndUpdate({ _id: id }, updatedProduct, {
    new: true,
  })
  if (!categoryUpdated) {
    next(ApiError.badRequest(404, `Category is not found with this id: ${id}`))
    return
  }
  return categoryUpdated
}
