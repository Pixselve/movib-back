import {Router} from "express";

const router = Router();
import {MyError} from "../classes/MyError";
import {MongoError} from "mongodb";
import {errors} from "celebrate";

import api from "./api";
//Indique que le router doit utiliser le module « api » en suivant la route « /api »
router.use("/api", api);
//Si on essaye d'atteindre une route non définie, on envoie une erreur 404
router.get('*', function (req, res, next) {
  next(new MyError(404, "Page not found."));
});
//On indique au router d'utiliser la gestion d'erreurs Celebrate
router.use(errors());
//Gestion de l'erreur si c'est une erreur Mongo (rapport à une erreur de validation lors de la création d'un élément dans la base de données par exemple)
router.use((err, req, res, next) => {
  if (err instanceof MongoError) {
    return res.status(400).json({error: {status: 503, message: err.message}});
  } else {
    next(err);
  }
});
//Gestion de toutes les autres erreurs (y compris les nôtres)
router.use((err, req, res, next) => {
  const {status, message} = err;
  res.status(status || 400).json({error: {status, message}});
});
export default router;
