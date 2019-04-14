const router = require("express").Router();
const fetch = require("node-fetch");
import Movie from "@models/Movie";
import {celebrate, errors, Joi} from "celebrate";
import {MyError} from "@root/classes/MyError";
import getColor = require("get-image-colors");


router.get('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    //  Vérifie si le film existe dans la base de donnée
    let movie = await Movie.findOne({tmdbId: id});
    if (movie) {
      // Le film existe dans la base de donnée
      res.status(200).send(movie);
    } else {
      //  Le film n'existe pas dans la base de donnée
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`);
      if (!response.ok) throw new MyError(500, "Unable to fetch movie data.");
      const responseJson = await response.json();
      // Extrait les données de la réponse
      const {backdrop_path, genres, id: tmdbId, imdb_id: imdbId, original_language: originalLanguage, overview: plot, poster_path, release_date: releaseDate, title} = responseJson;
      // Recupère les couleurs du poster et du backdrop
      const [backdropColor, posterColor] = await Promise.all([await getImageColor(`https://image.tmdb.org/t/p/w300/${backdrop_path}`), await getImageColor(`https://image.tmdb.org/t/p/w92/${poster_path}`)]);
      // Ajout du film dans la base de donnée
      const newMovie = await Movie.create({
        title,
        imdbId,
        originalLanguage,
        plot,
        releaseDate,
        genres,
        tmdbId,
        backdrop: {path: backdrop_path, color: backdropColor},
        poster: {path: poster_path, color: posterColor}
      });
      if (!newMovie) throw new MyError(500, "Unable to create the movie.");
      res.status(201).json(newMovie);
    }
  } catch (e) {
    res.status(500).json({e});
  }
});

const getImageColor = async (imageURL: String) => {
  try {
    const colors = await getColor(imageURL);

    colors.sort((a, b) => b.hsl()[1] - a.hsl()[1]);
    return colors[0].saturate(10).hex();
  } catch (e) {
    throw e;
  }
};


module.exports = router;
