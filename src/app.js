const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const express = require("express");
const cookieParser = require("cookie-parser");

const apiRouter = require("#app/routes/api");
const indexRouter = require("#app/routes/index");
const apiResponse = require("#app/helpers/apiResponse");

const app = express();

/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use("/api/", apiRouter);


app.all("*", (req, res) => {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, "err.message");
  }
});

module.exports = app;
