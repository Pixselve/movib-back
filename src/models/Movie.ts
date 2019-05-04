import axios from "axios";
import * as getColor from "get-image-colors";

import {arrayProp, ModelType, prop, staticMethod, Typegoose} from 'typegoose';

class Genre {
  @prop({required: true})
  id: Number;
  @prop({required: true})
  name: String;
}

class Image {
  @prop()
  path?: String;
  @prop()
  color?: String;
}

export class Movie extends Typegoose {
  @prop({required: true, unique: true})
  tmdbId: Number;
  @prop({unique: true})
  imdbId: String;
  @prop({required: true})
  title: String;
  @prop()
  releaseDate?: Date;
  @prop({required: true})
  originalLanguage: String;
  @prop()
  plot?: String;
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
        let colorArr = [];
        if (backdrop_path) {
          colorArr.push(await getImageColor(`https://image.tmdb.org/t/p/w300/${backdrop_path}`));
        } else {
          colorArr.push(null);
        }
        if (poster_path) {
          colorArr.push(await getImageColor(`https://image.tmdb.org/t/p/w92/${poster_path}`));
        } else {
          colorArr.push(null);
        }
        const [backdropColor, posterColor] = await Promise.all(colorArr);
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
    const responseMovie = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "fr",
        region: "FR"
      }
    });
    return responseMovie.data;
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