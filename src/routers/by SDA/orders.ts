// import express from 'express'
// const router = express.Router()

// import OrderModel from '../../models/order'
// import { User } from '../../models/user'

// router.get('/', async (req, res) => {
//   const orders = await OrderModel.find().populate('products')
//   res.json(orders)
// })

// router.post('/', async (req, res, next) => {
//   const { name, products } = req.body

//   const order = new OrderModel({
//     name,
//     products,
//   })
//   console.log('orderId:', order._id)

//   const user = new User({
//     name: 'Walter',
//     order: order._id,
//   })

//   await order.save()
//   await user.save()
//   res.json(order)
// })

// export default router
