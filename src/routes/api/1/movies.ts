import {Router} from "express";

const router = Router();
import Movie from "@models/Movie";
import User from "@models/User";
import {celebrate, Joi} from "celebrate";
import {MyError} from "@root/classes/MyError";
import getColor = require("get-image-colors");
import {ensureToken} from '@root/controllers/authentification';


router.get('/recommendations', ensureToken, async (req, res, next) => {
  try {
    const user = await User.findOne({username: req.decoded.username});
    if (!user) throw new MyError(404, "Unable to find the user.");
    const data = await user.getMovieRecommendations();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});
// router.get('/:id', async (req, res, next) => {
//   try {
//     const {id} = req.params;
//     //  Vérifie si le film existe dans la base de donnée
//     let movie = await Movie.findOne({tmdbId: id});
//     if (movie) {
//       // Le film existe dans la base de donnée
//       res.status(200).send(movie);
//     } else {
//       //  Le film n'existe pas dans la base de donnée
//       const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`);
//       if (!response.ok) throw new MyError(500, "Unable to fetch movie data.");
//       const responseJson = await response.json();
//       // Extrait les données de la réponse
//       const {backdrop_path, genres, id: tmdbId, imdb_id: imdbId, original_language: originalLanguage, overview: plot, poster_path, release_date: releaseDate, title} = responseJson;
//       // Recupère les couleurs du poster et du backdrop
//       const [backdropColor, posterColor] = await Promise.all([await getImageColor(`https://image.tmdb.org/t/p/w300/${backdrop_path}`), await getImageColor(`https://image.tmdb.org/t/p/w92/${poster_path}`)]);
//       // Ajout du film dans la base de donnée
//       const newMovie = await Movie.create({
//         title,
//         imdbId,
//         originalLanguage,
//         plot,
//         releaseDate,
//         genres,
//         tmdbId,
//         backdrop: {path: backdrop_path, color: backdropColor},
//         poster: {path: poster_path, color: posterColor}
//       });
//       if (!newMovie) throw new MyError(500, "Unable to create the movie.");
//       res.status(201).json(newMovie);
//     }
//   } catch (e) {
//     res.status(500).json({e});
//   }
// });

router.get('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const movie = await Movie.findOrCreate(parseInt(id));
    res.status(200).json(movie);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/update', ensureToken, celebrate({
  body: Joi.object().keys({
    watched: Joi.boolean(),
    followed: Joi.boolean(),
    rating: Joi.number().integer().min(0).max(50)
  })
}), async (req, res, next) => {
  try {
    const {id} = req.params;
    const {watched, followed, rating} = req.body;
    const {username} = req.decoded;
    const [movie, user] = await Promise.all([await Movie.findOne({tmdbId: id}), await User.findOne({username})]);
    if (!movie) throw new MyError(404, `The movie with id "${id}" is not found.`);
    if (!user) throw new MyError(404, `The user is not found.`);
    // Verifie si le film existe déjà dans le repertoire de l'utilisateur
    const movieIndex = user.movies.findIndex(el => el.movie.toString() === movie._id.toString());
    let newUser;
    if (movieIndex >= 0) {
      if (watched) user.movies[movieIndex].watched = watched;
      if (followed) user.movies[movieIndex].followed = followed;
      if (rating) user.movies[movieIndex].rating = rating;
      newUser = await user.save();
    } else {
      user.movies.push({
        movie: movie._id,
        watched: watched || false,
        followed: followed || false,
        rating: rating || -1
      });
      newUser = await user.save();
    }
    if (!newUser) throw new MyError(500, 'Unable to save the user.');
    res.status(200).json(newUser);
  } catch (e) {
    next(e);
  }
});
//
// const getImageColor = async (imageURL: String) => {
//   try {
//     const colors = await getColor(imageURL);
//
//     colors.sort((a, b) => b.hsl()[1] - a.hsl()[1]);
//     return colors[0].saturate(10).hex();
//   } catch (e) {
//     throw e;
//   }
// };


module.exports = router;
