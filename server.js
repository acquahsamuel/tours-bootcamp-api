const app = require('./app')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Load env variables
dotenv.config({ path: './config/config.env' })

connectDB()

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
