const fs = require("fs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Tour = require("./models/tourModel");
const User = require("./models/userModel");
const Review = require("./models/reviewModel");

dotenv.config({ path: "./config/config.env" });

connectDB();

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, "utf-8")
);

const review = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, "utf-8")
);

// Importing data into the database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave : false});
    await Review.create(review);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully deleted ");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === `-i`) {
  importData();
} else if (process.argv[2] === `-d`) {
  deleteData();
}
