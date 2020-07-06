const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const Tour = require('./../../models/tourModel')

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
)

// Importing data into the database
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data successfully loaded')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

//DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Data successfully deleted ')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

if (process.argv[2] === `--import`) {
  importData()
} else if (process.argv[2] === `--delete`) {
  deleteData()
}
