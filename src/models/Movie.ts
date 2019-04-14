import mongoose = require("mongoose");

export interface IMovie extends mongoose.Document {
  tmdbId: Number
  imdbId: String
  title: String
  releaseDate: Date
  originalLanguage: String
  plot: String
  genres: Genre[]
  backdrop: Image
  poster: Image
}

interface Genre {
  id: String
  name: String
}

interface Image {
  path: String
  colors: String
}

export const MovieSchema = new mongoose.Schema({
  tmdbId: {type: Number, required: true},
  imdbId: {type: String, required: true},
  title: {type: String, required: true},
  releaseDate: {type: Date, required: true},
  originalLanguage: {type: String, required: true},
  plot: {type: String, required: true},
  genres: {type: [{id: {type: Number, required: true}, name: {type: String, required: true}}], required: true},
  backdrop: {
    path: {type: String, required: true},
    color: {type: String, required: true}
  },
  poster: {
    path: {type: String, required: true},
    color: {type: String, required: true}
  }
});

const Movie = mongoose.model<IMovie>('Movie', MovieSchema);
export default Movie;
