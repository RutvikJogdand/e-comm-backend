const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require('cors')
const bodyParser = require("body-parser")
const { MongoClient } = require('mongodb');
// Data:
const usersData = require("./users")
const productsData = require("./products")
// Models:
const Users = require("./models/users_model")
const Products = require("./models/products_model")


dotenv.config()


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));

app.use( cors() )
app.use( express.json() )

const uri = `mongodb+srv://${process.env.USERNAME2}:${process.env.PASSWORD}@cluster0.celbe.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(
  uri,
).then(() => {
    console.log("Connected to database")
}).catch(err => {
    console.log("Error connecting to database", err)
});

const db = mongoose.createConnection(uri);
db.once("open", async (req, result) => {
    console.log(req)
  if ((await Users.countDocuments().exec()) > 0) {
    return;
  }
   await Users.insertMany(usersData)
  
});

app.listen(5000, () => {
  console.log("Server is up and running on 5000");
});
