import fetch from 'node-fetch';
import * as getColor from "get-image-colors";

import {arrayProp, ModelType, prop, staticMethod, Typegoose} from 'typegoose';

class Genre {
  @prop({required: true})
  id: Number;
  @prop({required: true})
  name: String;
}

class Image {
  @prop({required: true})
  path: String;
  @prop({required: true})
  color: String;
}

export class Movie extends Typegoose {
  @prop({required: true, unique: true})
  tmdbId: Number;
  @prop({required: true, unique: true})
  imdbId: String;
  @prop({required: true})
  title: String;
  @prop({required: true})
  releaseDate: Date;
  @prop({required: true})
  originalLanguage: String;
  @prop({required: true})
  plot: String;
  @arrayProp({items: Genre})
  genres: Genre[];
  @prop({required: true})
  backdrop: Image;
  @prop({required: true})
  poster: Image;

  @staticMethod
  static async findOrCreate(this: ModelType<Movie> & typeof Movie, tmdbId: Number) {
    try {
      let movie = await this.findOne({tmdbId});
      if (!movie) {
        const {backdrop_path, genres, imdb_id: imdbId, original_language: originalLanguage, overview: plot, poster_path, release_date: releaseDate, title} = await getMovieDataFromApi(tmdbId);
        const [backdropColor, posterColor] = await Promise.all([await getImageColor(`https://image.tmdb.org/t/p/w300/${backdrop_path}`), await getImageColor(`https://image.tmdb.org/t/p/w92/${poster_path}`)]);
        movie = await this.create({
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
      }
      return movie;
    } catch (e) {
      throw e;
    }
  }
}


const getMovieDataFromApi = async (tmdbId: Number) => {
  try {
    const responseMovie = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&region=FR`);
    if (!responseMovie.ok) throw new Error("Unable to get the movie data from the api.");
    return await responseMovie.json();
  } catch (e) {
    throw e;
  }
};
const getImageColor = async (imageURL: String) => {
  try {
    const colors = await getColor(imageURL);
    colors.sort((a, b) => b.hsl()[1] - a.hsl()[1]);
    return colors[0].saturate(10).hex();
  } catch (e) {
    throw e;
  }
};

export default new Movie().getModelForClass(Movie);


// const Schema = mongoose.Schema;
//
// export interface IMovie extends mongoose.Document {
//   tmdbId: Number
//   imdbId: String
//   title: String
//   releaseDate: Date
//   originalLanguage: String
//   plot: String
//   genres: Genre[]
//   backdrop: Image
//   poster: Image
// }
//
// interface Genre {
//   id: String
//   name: String
// }
//
// interface Image {
//   path: String
//   colors: String
// }
//
// export const MovieSchema = new Schema({
//   tmdbId: {type: Number, required: true},
//   imdbId: {type: String, required: true},
//   title: {type: String, required: true},
//   releaseDate: {type: Date, required: true},
//   originalLanguage: {type: String, required: true},
//   plot: {type: String, required: true},
//   genres: {type: [{id: {type: Number, required: true}, name: {type: String, required: true}}], required: true},
//   backdrop: {
//     path: {type: String, required: true},
//     color: {type: String, required: true}
//   },
//   poster: {
//     path: {type: String, required: true},
//     color: {type: String, required: true}
//   }
// });
// MovieSchema.statics.getOrCreate = async function (tmdbId: Number) {
//   const movie = await this.findOne({tmdbId});
// };
//
//
// const Movie = mongoose.model<IMovie>('Movie', MovieSchema);
// export default Movie;
