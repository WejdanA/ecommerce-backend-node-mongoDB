import { Router } from 'express'

import * as controller from '../controllers/ordersController'
import { isAdmin, isLoggedIn, isNotAdmin } from '../middlewares/authentication'
import { orderValidation } from '../validation/ordersValidation'
import { runValidation } from '../validation/runValidation'

const router = Router()

//GET --> get all user orders
router.get('/', isLoggedIn, isNotAdmin, controller.getOrdersForUser)

//GET --> get all orders for an admin
router.get('/all-orders', isLoggedIn, isAdmin, controller.getOrdersForAdmin)

//GET --> create an order
router.post('/process-payment', isLoggedIn, isNotAdmin, controller.handleProcessPayment)

//DELETE --> delete a single order by ID
router.delete('/:id([0-9a-fA-F]{24})', isLoggedIn, isAdmin, controller.deleteOrder)

//PUT --> update a single order by ID
router.put('/:id([0-9a-fA-F]{24})', isLoggedIn, isAdmin, controller.updateOrder)

export default router
