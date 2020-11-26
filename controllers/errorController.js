const sendErroDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  /**Operational , trusted error : send message to client */
  if(err.isOperational){

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })


    /** Programming or other unknow error : don't expose error details  */
  }else{

    /**Log Error */
    console.error('ERROR', err);

    res.status(500).json({status : 'error', message : 'Something went very wrong'})
  }

}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || `error`

  if ((process, env.NODE_ENV === 'production')) {
    sendErroDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res)
  }
}
