import { Router } from 'express'

import * as controller from '../controllers/productsController'

import { isAdmin, isLoggedIn } from '../middlewares/authentication'
import { upload } from '../middlewares/uploadFile'

import { productValidation, productValidationUpdate } from '../validation/productsValidation'
import { runValidation } from '../validation/runValidation'

const router = Router()

// GET --> get all products
router.get(`/`, controller.getAllProducts)
//GET --> get a single product by ID
router.get(`/:id`, controller.getSingleProduct)
//DELETE --> delete a single product by ID
router.delete(`/:id`, isLoggedIn, isAdmin, controller.deleteProduct)
//POST --> create a product
router.post(
  '/',
  isLoggedIn,
  isAdmin,
  upload.single('image'),
  productValidation,
  runValidation,
  controller.createProduct
)
//PUT --> update a single product by ID
router.put(
  `/:id`,
  isLoggedIn,
  isAdmin,
  upload.single('image'),
  productValidationUpdate,
  runValidation,
  controller.updateProduct
)

export default router
