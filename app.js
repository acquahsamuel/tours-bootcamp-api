const express = require('express')
const morgan = require('morgan')

const app = express();

/* Middlewares */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Development or Production Environments

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/api/V1/tours', tourRouter);
app.use('/api/V1/users', userRouter);

module.exports = app;


/*
 Representational State Transfer 
 Enveloping
 API should be stateless  ** 
 How stateless API works 

 Routes handler
 Response Cycle 
*/
