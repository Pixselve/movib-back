import {Router} from "express";
import {ensureToken} from "../../../controllers/authentification";
import {celebrate, Joi} from "celebrate";
import BlacklistJWT from "../../../models/BlacklistJWT";

import {MyError} from "../../../classes/MyError";
import User from '../../../models/User';

const router = Router();


/**
 * @api {post} /user/ Informations utilisateur
 * @apiVersion 1.0.0
 * @apiName GetUserInfos
 * @apiGroup User
 * @apiPermission User
 *
 * @apiSuccess {String} username Nom d'utilisateur.
 * @apiSuccess {String} firstName Prénom.
 * @apiSuccess {String} lastName Nom de famille.
 * @apiSuccess {Date} birthDate Date de naissance.
 * @apiSuccess {String} email Adresse email.
 * @apiSuccess {Date} createdAt Date à laquelle l'utilisateur s'est inscrit.
 *
 * @apiSuccessExample Success-Response:
 {
    "username": "pixselve",
    "firstName": "mael",
    "lastName": "kerichard",
    "birthDate": "2001-09-07T22:00:00.000Z",
    "email": "mael@maelkerichard.com",
    "createdAt": "2019-04-15T14:45:02.871Z"
}
 */

router.get("/", ensureToken, async (req, res, next) => {
  try {
    const user = req.user.toObject();
    const {password, interactionsLog, updatedAt, _id, __v, ...data} = user;
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});
/**
 * @api {post} user/register Création d'un compte
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam {String} username Nom d'utilisateur
 * @apiParam {String} password Mot de passe
 * @apiParam {String} firstName Prénom
 * @apiParam {String} lastName Nom de famille
 * @apiParam {Date} birthDate Date de naissance
 * @apiParam {String} email Adresse email

 *
 * @apiSuccess {Boolean} success Si l'action a bien été effectuée.
 * @apiSuccess {String} token Json Web Token de l'utilisateur.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBpeHNlbHZlIiwiaWF0IjoxNTU2OTg1MTc1LCJleHAiOjE1NTcwNzE1NzV9.5cSPJ1OqH41kg7t5fl98maMZr-8p34y7xX4Dumx-miA"
   }
 * @apiError UserNotCreated User can't be created.
 * @apiErrorExample Error-Response:
 *     {
 *       "status": 500,
 *       "message": "User can't be created."
 *     }
 */

router.post('/register', celebrate({
  body: Joi.object().keys({
    username: Joi.string().required().alphanum().min(3).max(100),
    password: Joi.string().required().min(3).max(255),
    firstName: Joi.string().required().alphanum().min(3).max(100),
    lastName: Joi.string().required().alphanum().min(3).max(100),
    birthDate: Joi.date().required().max('now'),
    email: Joi.string().email().required()
  })
}), async (req, res, next) => {
  try {
    const {username, password, firstName, lastName, birthDate, email} = req.body;
    let user = await User.create({username, password, firstName, lastName, birthDate, email});
    if (!user) throw new MyError(500, "User can't be created.");
    let token = user.generateToken();
    res.status(201).json({success: true, token});
  } catch (e) {
    next(e);
  }


});

/**
 * @api {post} user/login Connexion à un compte
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam {String} username Nom d'utilisateur
 * @apiParam {String} password Mot de passe
 *
 *
 * @apiSuccess {Boolean} success Si l'action a bien été effectuée.
 * @apiSuccess {String} token Json Web Token de l'utilisateur.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBpeHNlbHZlIiwiaWF0IjoxNTU2OTg1MTc1LCJleHAiOjE1NTcwNzE1NzV9.5cSPJ1OqH41kg7t5fl98maMZr-8p34y7xX4Dumx-miA"
   }
 * @apiError IncorrectUsername The user with username "username" is not found.
 * @apiError IncorrectPassword The password you have entered is incorrect.
 * @apiErrorExample Error-Response:
 *     {
 *       "status": 404,
 *       "message": "The user with username "username" is not found."
 *     }
 */

router.post('/login', celebrate({
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
}), async (req, res, next) => {
  try {
    const {username, password} = req.body;
    let user = await User.findOne({username: username.toLowerCase()});
    if (!user) throw new MyError(404, `The user with username "${username}" is not found.`);
    let match = await user.comparePassword(password);
    if (!match) throw new MyError(403, 'The password you have entered is incorrect.');
    const token = user.generateToken();
    res.json({success: true, token});
  } catch (e) {
    next(e);
  }
});

/**
 * @api {post} user/change-password Changement de mot de passe
 * @apiVersion 1.0.0
 * @apiName ChangePassword
 * @apiGroup User
 * @apiPermission User
 *
 * @apiParam {String} oldPassword Ancien mot de passe
 * @apiParam {String} newPassword Nouveau mot de passe
 *
 * @apiSuccess {Boolean} success Si l'action a bien été effectuée.
 *
 * @apiSuccessExample Success-Response:
 * {
    "success": true
   }
 * @apiError ShouldBeDifferent The new password should be different.
 * @apiErrorExample Error-Response:
 *     {
 *       "status": 400,
 *       "message": "The new password should be different."
 *     }
 */


router.post("/change-password", ensureToken, celebrate({
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  })
}), async (req, res, next) => {
  try {
    const {oldPassword, newPassword} = req.body;
    if (oldPassword === newPassword) throw new MyError(400, "The new password should be different");
    await req.user.changePassword(oldPassword, newPassword);
    res.status(200).json({success: true});
  } catch (e) {
    next(e);
  }
});

/**
 * @api {PUT} user Mise à jour des informations utilisateur
 * @apiVersion 1.0.0
 * @apiName ChangeUserInfo
 * @apiGroup User
 * @apiPermission User
 *
 * @apiParam {String} email Nouvelle adresse email
 * @apiParam {String} newPassword Nouveau mot de passe
 *
 * @apiSuccess {Boolean} success Si l'action a bien été effectuée.
 *
 * @apiSuccessExample Success-Response:
 * {
    "success": true
   }
 */

router.put("/", ensureToken, celebrate({
  body: Joi.object().keys({
    email: Joi.string().email(),
    newPassword: Joi.string()
  })
}), async (req, res, next) => {
  try {
    const {email, newPassword, newPasswordConfirmation} = req.body;
    if (email) {
      req.user.email = email
    }
    if (newPassword) {
      req.user.password = newPassword
    }
    await req.user.save();
    res.status(200).json({success: true});
  } catch (e) {
    next(e);
  }
});
/**
 * @api {post} user/logout Déconnexion
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup User
 * @apiPermission User
 *
 * @apiSuccess {Boolean} success Si l'action a bien été effectuée.
 *
 * @apiSuccessExample Success-Response:
 * {
    "success": true
   }
 */
router.post("/logout", ensureToken, async (req, res, next) => {
  try {
    // @ts-ignore
    const {token, decoded} = req;
    const expiration = new Date(decoded.exp * 1000);
    await BlacklistJWT.create({token, expiration});
    res.status(200).json({success: true});
  } catch (e) {
    next(e);
  }
});

export default router;