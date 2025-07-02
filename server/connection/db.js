const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://localhost:27017/Application");

module.exports = connect;