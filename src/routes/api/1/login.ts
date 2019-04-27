const router = require("express").Router();
import {celebrate, Joi} from "celebrate";

import {ensureToken} from '../../../controllers/authentification';
import {MyError} from "../../../classes/MyError";
import User from '../../../models/User';


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
router.get('/protected', ensureToken, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new MyError(404, 'User not found.');
    let {firstName, lastName, username} = user;
    res.status(200).json({success: true, data: {username, firstName, lastName}});
  } catch (e) {
    next(e);
  }
});
module.exports = router;
