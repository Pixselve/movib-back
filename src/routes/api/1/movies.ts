import {Router} from "express";

const router = Router();

import MovieInteraction from "../../../models/MovieInteraction";
import {celebrate, Joi} from "celebrate";

import {ensureToken} from '../../../controllers/authentification';


router.get('/recommendations', ensureToken, celebrate({
  query: Joi.object().keys({
    limit: Joi.number().max(10).min(1)
  })
}), async (req, res, next) => {
  try {
    const {limit} = req.query;
    const user = req.user;
    const data = await user.getMovieRecommendations(limit || 10);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', ensureToken, async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = req.user;
    const movie = await MovieInteraction.findOrCreate(user._id, parseInt(id));
    res.status(200).json(movie);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/update', ensureToken, celebrate({
  body: Joi.object().keys({
    watched: Joi.boolean(),
    followed: Joi.boolean(),
    rating: Joi.number().integer().min(0).max(5)
  })
}), async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = req.user;
    const {watched, followed, rating} = req.body;
    const movieInteraction = await MovieInteraction.update(user._id, id, {watched, followed, rating});
    res.status(200).json(movieInteraction);
  } catch (e) {
    next(e);
  }
});


module.exports = router;
