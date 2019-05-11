import {ModelType, prop, Ref, staticMethod, Typegoose} from 'typegoose';
import {User} from './User';
import Movie, {Movie as MovieSchema} from './Movie';
import axios from "axios";

//Schema qui définie comment est stocké une action entre un film et un utilisateur dans la base de données
export class MovieInteraction extends Typegoose {
  @prop({ref: User, required: true})
  user: Ref<User>;
  @prop({ref: MovieSchema, required: true})
  movie: Ref<MovieSchema>;
  @prop({required: true})
  followed: Boolean;
  @prop({required: true})
  watched: Boolean;
  @prop({required: true, min: -1, max: 10})
  rating: Number;

  //Methode qui permet de mettre à jour des données en fonction d'un utilisateur et d'un film. Ces données peuvent être si le film est suivi ou sa note
  @staticMethod
  static async update(this: ModelType<MovieInteraction> & typeof MovieInteraction, userId: String, movieId: String, data: { watched?: Boolean, followed?: Boolean, rating?: Number }) {
    const {watched, followed, rating} = data;


    const interaction = await this.findOneAndUpdate({user: userId, movie: movieId}, {
        watched,
        followed,
        rating
      },
      // @ts-ignore
      {omitUndefined: true, new: true});
    return interaction;
  }
  //Méthode qui soit, trouve une intéraction film/utilisateur dans la base de données, soit le crés
  @staticMethod
  static async findOrCreate(this: ModelType<MovieInteraction> & typeof MovieInteraction, userId: String, tmdbId: Number) {
    try {
      //Trouve ou crés le film dans la base de données
      const {id: movieID} = await Movie.findOrCreate(tmdbId);
      const interaction = await this.findOne({user: userId, movie: movieID}).populate('movie');
      if (interaction) {
        return await interaction.populate('movie');
      } else {
        const movie = await Movie.findOrCreate(tmdbId);
        const newInteraction = await this.create({
          user: userId,
          movie: movie._id,
          followed: false,
          rating: -1,
          watched: false
        });
        return await newInteraction.populate('movie').execPopulate();
      }
    } catch (e) {
      throw e;
    }
  }
  //Method qui permet de rechercher un film par son nom ou son année de parution
  @staticMethod
  static async search(this: ModelType<MovieInteraction> & typeof MovieInteraction, userId: String, query: { q?: string, year?: number }) {
    try {
      const {q, year} = query;
      //Recupère les données depuis l'API
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fr",
          region: "FR",
          query: q,
          primary_release_year: year
        }
      });
      //Trouve ou crés les films dans las base de donnée
      return await Promise.all(response.data.results.map(movie => this.findOrCreate(userId, movie.id)));
    } catch (e) {
      throw e;
    }
  }
  //Methode qui permet de trouver des films en fonction de genres, d'année de parution ou de langue originale
  @staticMethod
  static async discover(this: ModelType<MovieInteraction> & typeof MovieInteraction, userId: String, data: { genres: number[], lang: string, year: number }) {
    try {
      const {genres, lang, year} = data;
      //Recupère les données depuis l'API
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fr",
          region: "FR",
          with_genres: genres,
          primary_release_year: year,
          with_original_language: lang
        }
      });
      //Trouve ou crés les films dans las base de donnée
      return await Promise.all(response.data.results.map(movie => this.findOrCreate(userId, movie.id)));
    } catch (e) {
      throw e;
    }
  }
}

export default new MovieInteraction().getModelForClass(MovieInteraction, {schemaOptions: {timestamps: true}});
