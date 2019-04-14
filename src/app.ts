const dotENV = require('dotenv').config({path: "../.env"});
if (dotENV.error) {
  throw dotENV.error;
}
require("module-alias/register");


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const colors = require("colors");
const bodyParser = require('body-parser');
import * as moment from "moment";


moment.locale("fr");

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const router = require("./routes");
app.use("/", router);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/test?retryWrites=true`,
    {useNewUrlParser: true}
  )
  .then(res => {
    console.log(
      colors.bgBlack(moment().format("L - LT")),
      "✔  Connected to the database.".white.bgGreen
    );
    app.listen(port, () =>
      console.log(
        colors.bgBlack(moment().format("L - LT")),
        `✔  Server started and listening to port ${port}`.white.bgGreen
      )
    );
  })
  .catch(err => {
  });
