// Import des différentes bibliothèques
import * as mongoose from "mongoose";
import * as moment from "moment";
import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import chalk from 'chalk';
import {config} from "dotenv";

//Import des différentes routes
import router from "./routes";

//Execution de dotENV permettant d'utiliser des variables globales sotckées dans un fichier .env
const dotENV = config({path: `${__dirname}/.env`});
if (dotENV.error) {
  throw dotENV.error;
}
//Change les règles de moment pour la France
moment.locale("fr");

const app = express();
//Le port qu'utilise l'application est soit une variable globale (définie par Google Cloud) soit 3001 (pour le développement)
const port = process.env.PORT || 3001;
//L'host qu'utilise l'application est soit une variable globale (définie par Google Cloud) soit 0.0.0.0 (pour le développement)
const host = process.env.HOST || '0.0.0.0';

//Middleware CORS qui permet de d'accepter les requêtes Cross-origin
app.use(cors());
//Configuration de bodyParser (permet de décoder le body des requêtes POST notamment)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//Demande à l'application d'utiliser les routes précédement importées
app.use("/", router);

//Connexion à la base de données MongoDB avec Mongoose
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/test?retryWrites=true`,
    {useNewUrlParser: true}
  )
  .then(res => {
    //Confirme la connexion à la base de données
    console.log(
      chalk.bgWhite.black(moment().format("L - LT")),
      chalk.bgGreen.white("✔  Connected to the database.")
    );
    // @ts-ignore
    //Démarrage et confirmation de démarrage de l'application
    app.listen(port, host, () =>
      console.log(
        chalk.bgWhite.black(moment().format("L - LT")),
        chalk.bgGreen.white(`✔  Server started and listening to port ${port}.`)
      )
    );
  })
  .catch(err => {
    //Signale un problème lors de la connexion à la base de données
    console.log(chalk.bgWhite.black(moment().format("L - LT")), chalk.bgRed.black("Unable to connect to the database."));
  });
