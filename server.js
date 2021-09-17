const dotenv = require("dotenv");
const connectDB = require("./config/db");

process.on("uncaughtException", err => {
  console.log("UNCAUGHT EXCEPTION Shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

// Load env variables
dotenv.config({ path: "./config/config.env" });
const app = require("./app");

// Connect to mongodb 
connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//
process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});




