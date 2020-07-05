const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({ path: './config.env' })

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log(
      `Connection to database(development) successful ${
        process.env.DATABASE_LOCAL
      }`
    )
  })

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
