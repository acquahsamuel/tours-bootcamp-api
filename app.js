const express = require('express')
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express()

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

app.use(express.json())
app.use(express.static(`${__dirname}/public`))


app.use((req, res, next) =>{
  req.requestTime = new Date().toISOString();
  next();
})

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}



// Mounting Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

//If the routes in the url cannot be found (Really important)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})


app.use(globalErrorHandler)

module.exports = app
