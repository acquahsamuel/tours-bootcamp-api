const path = require("path");
const hpp = require("hpp");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const express = require("express");
const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const mongoSanitize = require("express-mongo-sanitize");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require('./routes/viewRoutes');

/**Middlewares */
/**Set Security */
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**Limit request from some API */
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP , Please try again in an hour!"
});
app.use("/api", limiter);

/**Body parser , reading data from body into req.body */
app.use(express.json({ limit: "15kb" }));
app.use(cookieParser());

/**Data Sanitization against NoSQL query injection */
app.use(mongoSanitize());

/**Data Sanitization against XSS */
app.use(xss());

/**Prevent parameter pollution on mongodb */
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);

/**Serving Static files  */
app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});


// Mounting Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//Mounting View Routes
app.use('/' , viewRouter);


//If the routes in the url cannot be found (Really important)
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
