const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Load env variables
dotenv.config({ path: './config/config.env' })
const app = require('./app')

connectDB()

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

