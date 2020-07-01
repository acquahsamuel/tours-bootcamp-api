const fs = require("fs");
const express = require("express");

const app = express();

/* Middlewares */
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

const port = 8000 || process.env.PORT;

app.listen(`${port}`, () => {
  console.log(`Listening on port ${port}`);
});
