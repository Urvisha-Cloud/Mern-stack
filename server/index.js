require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connection = require("./connection/db");
const userRoute = require("./controller/routes.user");
const taskRoute = require("./controller/routes.todo");

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json());//use
app.use(cors({//use
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use("/task", taskRoute);
app.use("/user", userRoute);

app.listen(port, async (err) => {
  await connection;
  err
    ? console.log("something went wrong", err)
    : console.log("server is running at port", port);
});
