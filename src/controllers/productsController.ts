import { NextFunction, Request, Response } from 'express'
import fs from 'fs/promises'
import mongoose from 'mongoose'

import ApiError from '../errors/ApiError'
import { IProduct, Product } from '../models/product'
import * as services from '../services/productService'

// get all products
export const getAllProducts = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { allProducts, totalPage, currentPage } = await services.findAllProducts(request)

    if (allProducts.length) {
      response.status(200).json({
        message: `Return all products `,
        allProducts,
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
// get a specific product
export const getSingleProduct = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = request.params

    const singleProduct = await services.findProductById(id, next)

    response.status(200).json({
      message: `Return a single product `,
      product: singleProduct,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(ApiError.badRequest(400, `ID format is Invalid must be 24 characters`))
    } else {
      next(error)
    }
  }
}
// delete a specific product
export const deleteProduct = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params

    const deletedProduct = await services.findAndDeletedProduct(id, next)

    response.status(200).json({
      message: `Delete a single product with ID: ${id}`,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      if (error.path === '_id' && error.kind === 'ObjectId') {
        next(
          ApiError.badRequest(
            400,
            `Invalid ID format: ID format is Invalid must be 24 characters on schema  feild : ${error.path} : ${error.message}`
          )
        )
      } else {
        next(ApiError.badRequest(400, `Invalid data format. Please check your input`))
      }
    } else {
      next(error)
    }
  }
}
// create a new product
export const createProduct = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const newInput = request.body
    const imagePath = request.file?.path

    const productExist = await services.findIfProductExist(newInput, next)

    const newProduct: IProduct = new Product({
      name: newInput.name,
      price: newInput.price,
      quantity: newInput.quantity,
      sold: newInput.sold,
      description: newInput.description,
      categories: newInput.categories,
    })

    if (imagePath) {
      newProduct.image = imagePath
      console.log('Add Image')
    } else if (!imagePath) {
      console.log('No Image Yet!')
      next()
    }

    if (newProduct) {
      await newProduct.save()
    } else {
      next(ApiError.badRequest(400, `Invalid document`))
    }

    response.status(201).json({
      message: `Create a single product`,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw ApiError.badRequest(
        400,
        `Invalid ID format: ID format is Invalid must be 24 characters`
      )
    } else {
      next(error)
    }
  }
}
// update a specific product
export const updateProduct = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params
    const updatedProduct = request.body
    const newImage = request.file?.path

    let imgUrl = ''
    if (request.file?.path) {
      imgUrl = `${newImage}`
      updatedProduct.image = imgUrl

      //check product have image
      const productInfo = await Product.findById(id)
      const productImage = productInfo?.image

      if (productImage) {
        try {
          fs.unlink(productImage)
        } catch (error) {
          throw ApiError.badRequest(400, `Error deleting file:${error}`)
        }
      } else if (!productImage) {
        next()
      }
    }
    const productUpdated = await services.findAndUpdateProduct(id, request, next, updatedProduct)

    response.status(200).json({
      message: `Update a single product`,
      payload: productUpdated,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw ApiError.badRequest(400, `ID format is Invalid must be 24 characters`)
    } else {
      next(error)
    }
  }
}
