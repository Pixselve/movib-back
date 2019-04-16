import User from "../../../models/User";

const router = require("express").Router();
import {ensureToken} from '@root/controllers/authentification';
import {celebrate, Joi} from "celebrate";
import {MyError} from "@root/classes/MyError";


router.post('/', ensureToken, celebrate({
  body: Joi.object().keys({
    event: Joi.object().required().keys({
      tmdbId: Joi.number().required(),
      timestamp: Joi.string().required(),
      action: Joi.string().required()
    })
  })
}), async (req, res, next) => {
  try {
    const {timestamp, tmdbId, action} = req.body.event;
    const user = await User.findOne({username: req.decoded.username});
    if (!user) throw new MyError(404, 'User not found.');
    user.interactionsLog.push({timestamp, tmdbId, action});
    let newUser = await user.save();
    if (!newUser) throw new MyError(500, 'Unable to save the user.');
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});


module.exports = router;
