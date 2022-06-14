const express = require("express");
const app = express();

const route = require("./routes/route.js");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const multer = require('multer')
app.use(multer().any())


const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://Pratice:MVLNdVEz62Td6t7j@cluster0.q9vy5.mongodb.net/project-quora",
{ useNewUrlParser: true })
.then(() => console.log("DB connected & Running"))
.catch((err) => console.log(err));


app.use("/", route);


app.listen(process.env.PORT||3000, function () {
  console.log("Express app running on port " ,process.env.PORT||3000);});