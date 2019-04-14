const router = require("express").Router();
const fetch = require("node-fetch");
import {ensureToken} from '@root/controllers/authentification';
import Genre from "@models/Genres";

import getColor = require("get-image-colors");

class Movie {
  private title: string;
  private genres: string[];
  private plot: string;
  private backdrop: string;
  private backdropColor: string;
  private id: number;

  constructor(
    id: number,
    title: string,
    genres: string[],
    plot: string,
    backdrop: string,
    backdropColor: string,

  ) {
    this.id = id;
    this.title = title;
    this.genres = genres.map(el => el.name);
    this.plot = plot;
    this.backdrop = `https://image.tmdb.org/t/p/original${backdrop}`;
    this.backdropColor = backdropColor;
  }
}

const getMovie = async (movie: popularMovies.Result) => {
  try {
    // Récupère la couleur dominante de l'image
    const colors = await getColor(`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`);
    if (!colors) throw new Error("Can't get dominant color.");
    // Récupère les genres via leurs ids
    const genres = await Genre.find({id: {$in: movie.genre_ids}});
    if (!genres) throw new Error("Can't find the genres for this movie.");
    let color = colors.find(color => isDark(color.hex()));
    if (!color) color = color[0];

    return new Movie(
      movie.id,
      movie.title,
      genres,
      movie.overview,
      movie.backdrop_path,
      color.hex()
    );
  } catch (e) {
    throw e;
  }

};


router.get("/popular", ensureToken, async (req, res) => {
  // Verifie si la requête contient une quantité maximale inférieur à 10. Sinon, elle est mise sur 10.
  const maxElement =
    parseInt(req.query.max) <= 10 ? parseInt(req.query.max) : 10;
  try {
    const data = await fetch(
      `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&language=fr-FR&region=FR`
    );
    if (!data.ok) throw new Error("No data");
    const json = await data.json();
    let finalData = [];
    for (let i = 0; i < maxElement; i++) {
      finalData.push(await getMovie(json.results[i]));
    }
    await Promise.all(finalData);
    if (finalData.length) {
      res.status(200).json(finalData);
    } else {
      throw new Error("No data final");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});


const isDark = (color) => {

  // Variables for red, green, blue values
  let r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {

    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } else {

    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(
      color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  return hsp <= 127.5;
}


module.exports = router;
