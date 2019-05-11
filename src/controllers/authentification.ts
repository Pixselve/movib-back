import BlacklistJWT from "../models/BlacklistJWT";
import User from '../models/User';

import * as jwt from "jsonwebtoken";

//Déclaration globale avec Typescript permettant de ne pas avoir d'erreur lorsque l'on utilise req.user
declare global {
  namespace Express {
    interface Request {
      user: any
    }
  }
}
//Définition du Middleware ensureToken qui permet d'assurer que l'utilisateur est connecté lorsqu'il effectue la requête
export const ensureToken = async (req, res, next) => {
  try {
    //Recupère le Token dans le header de la requête
    const bearerHeader = req.headers['authorization'] || req.headers['x-access-token'];
    if (!bearerHeader) {
      res.status(403).json({status: 403, message: "You must be authenticated"});
      return;
    }
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    //Vérifie si le token et valide et non blacklisté (module logout)
    jwt.verify(bearerToken, process.env.AUTH_TOKEN, async (err, result) => {
      if (err) {
        res.status(403).json({status: 403, message: "You must be authenticated"});
        return;
      }
      const jwtBlacklist = await BlacklistJWT.findOne({token: bearerToken});
      if (jwtBlacklist) {
        res.status(403).json({status: 403, message: "You must be authenticated"});
        return;
      }
      //Cherche l'utilisateur correspondant au token
      const user = await User.findOne({username: result.username});
      if (!user) res.sendStatus(403);
      //Stocke différentes données dans l'objet req afin de pouvoir les utiliser plus tard
      req.decoded = result;
      req.token = bearerToken;
      req.user = user;
      next();
    });
  } catch (e) {
    res.status(500).json({status: 500, message: e});
  }
};
