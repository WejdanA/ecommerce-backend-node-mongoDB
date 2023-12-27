import { Router } from 'express'

import * as controller from '../controllers/categoriesController'

import { isAdmin, isLoggedIn } from '../middlewares/authentication'

import { categoryValidation } from '../validation/categoriesValidation'
import { runValidation } from '../validation/runValidation'

const router = Router()

//GET --> get all categories
router.get('/', controller.getAllCategories)
//GET --> get a single category by ID
router.get('/:id', controller.getSingleCategory)
//POST --> create a category
router.post('/', isLoggedIn, isAdmin, categoryValidation, runValidation, controller.createCategory)
//DELETE --> delete a single category by ID
router.delete('/:id', isLoggedIn, isAdmin, controller.deleteCategory)
//PUT --> update a single category by ID
router.put(
  '/:id',
  isLoggedIn,
  isAdmin,
  categoryValidation,
  runValidation,
  controller.updateCategory
)

export default router
