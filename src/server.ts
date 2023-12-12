import express, { Application, Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRouter from './routers/authRouter'
import usersRouter from './routers/usersRouter'
import ordersRouter from './routers/ordersRouter'
import productsRouter from './routers/productRouter'
import categoriesRouter from './routers/categoriesRouter'

import ApiError from './errors/ApiError'
import myLogger from './middlewares/logger'
import apiErrorHandler from './middlewares/errorHandler'

config()
const app: Application = express()
const PORT = 5050

mongoose.set('strictQuery', false)
mongoose.set('strictPopulate', false)
const URL = process.env.ATLAS_URL || 'mongodb://127.0.0.1:27017/full-stack-demo-db'

app.use(cors())
app.use(myLogger)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('imageUser'))

app.use('/products', productsRouter)
app.use('/categories', categoriesRouter)
app.use('/orders', ordersRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

app.get('/', (request: Request, response: Response) => {
  response.json({
    message: 'CheckUp The Server',
  })
})

app.use((request: Request, response: Response, next: NextFunction) => {
  next(ApiError.badRequest(404, `Router not Found`))
})

app.use(apiErrorHandler)

mongoose
  .connect(URL)
  .then(() => {
    console.log('Database connected')
  })
  .catch((err) => {
    console.log(`MongoDB connection error: ${err}`)
  })

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`)
})
