import * as mongoose from "mongoose";
import * as moment from "moment";
import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import chalk from 'chalk';
import {config} from "dotenv";

require("module-alias/register");

import router from "./routes";

const dotENV = config({path: "../.env"});
if (dotENV.error) {
  throw dotENV.error;
}
moment.locale("fr");

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use("/", router);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/test?retryWrites=true`,
    {useNewUrlParser: true}
  )
  .then(res => {
    console.log(
      chalk.bgWhite.black(moment().format("L - LT")),
      chalk.bgGreen.white("✔  Connected to the database.")
    );
    app.listen(port, () =>
      console.log(
        chalk.bgWhite.black(moment().format("L - LT")),
        chalk.bgGreen.white(`✔  Server started and listening to port ${port}.`)
      )
    );
  })
  .catch(err => {
    console.log(chalk.bgWhite.black(moment().format("L - LT")), chalk.bgRed.black("Unable to connect to the database."));
  });
