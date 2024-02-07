const express = require("express");
const ErrorHandler = require("./utils/ErrorHandler");
const app= express()
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
  }));
  app.use(bodyParser.json());
  app.use("/",express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));


// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "config/.env",
    });
  }



  // it's for ErrorHandling
app.use(ErrorHandler);

  module.exports = app;