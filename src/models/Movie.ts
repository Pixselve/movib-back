import axios from "axios";
import * as getColor from "get-image-colors";

import {arrayProp, ModelType, prop, staticMethod, Typegoose} from 'typegoose';
//Schema qui définie comment est stocké un genre
class Genre {
  @prop({required: true})
  id: Number;
  @prop({required: true})
  name: String;
}
//Schema qui définie comment est stocké une image
class Image {
  @prop()
  path?: String;
  @prop()
  color?: String;
}
//Schema qui définie comment est stocké un film dans la base de données
export class Movie extends Typegoose {
  @prop({required: true, unique: true})
  tmdbId: Number;
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
  @prop({required: false})
  budget: Number;
  @prop({required: false})
  revenue: Number;
  @prop({required: false})
  runtime: Number;
  @prop({required: false})
  originalTitle: string;
  //Méthode qui soit, trouve le film dans la base de données, soit le crés
  @staticMethod
  static async findOrCreate(this: ModelType<Movie> & typeof Movie, tmdbId: Number) {
    try {
      let movie = await this.findOne({tmdbId});
      if (!movie) {
        //Récupère les données depuis l'API
        const {backdrop_path, genres, original_language: originalLanguage, overview: plot, poster_path, release_date: releaseDate, title, budget, revenue, runtime, originalTitle} = await getMovieDataFromApi(tmdbId);
        let colorArr = [];
        //Recupère la couleur dominante et saturée du poster et du backdrop
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
        //Création du film
        movie = await this.create({
          title,
          originalLanguage,
          plot,
          releaseDate,
          genres,
          budget,
          revenue,
          originalTitle,
          runtime,
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

//Fonction qui récupère les données d'un film via son id grâce à l'API de themoviedb
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
//Fonction qui détermine la couleur dominante d'une image grâce à la bibliothèque get-image-colors et qui lui apporte une saturation maximale
const getImageColor = async (imageURL: String) => {
  try {
    const colors = await getColor(imageURL);
    //Trie les couleurs par leur saturation (HSL --> Hue Saturation Light)
    colors.sort((a, b) => b.hsl()[1] - a.hsl()[1]);
    return colors[0].saturate(10).hex();
  } catch (e) {
    throw e;
  }
};

export default new Movie().getModelForClass(Movie);