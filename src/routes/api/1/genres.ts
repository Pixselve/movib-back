import fetch from "node-fetch";

const router = Router();
import Genre from "../../../models/Genres";

import {Router} from "express";

router.get("/update", async (req, res) => {
  try {
    if (!req.query.auth) throw new MyError(400, "Please specify an auth token");
    if (!/[0-z]{20}/.test(req.query.auth)) throw new MyError(400, "Please specify a valid auth token");
    if (req.query.auth !== "m2oejqxz8rh2Ugz7b6Gy") throw new MyError(401, "Invalid auth token");
    const genresResponse = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&region=FR`);
    if (!genresResponse.ok) throw new MyError(500, "Internal server error");
    const genres = await genresResponse.json();

    Genre.insertMany(genres.genres).then(genres => {
      res.status(200).json(genres);
    }).catch(err => {
      console.log(err);
    });
  } catch (e) {
    res.status(e.status || 400).json({error: {message: e.message, status: e.status}});
  }
});

module.exports = router;

class MyError {
  private status;
  private message;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}
