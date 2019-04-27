import {ModelType, prop, Ref, staticMethod, Typegoose} from 'typegoose';
import {User} from './User';
import {Movie as MovieSchema} from './Movie';
import Movie from './Movie';

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

  @staticMethod
  static async findOrCreate(this: ModelType<MovieInteraction> & typeof MovieInteraction, userId: String, tmdbId: Number) {
    try {
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
}

export default new MovieInteraction().getModelForClass(MovieInteraction, {schemaOptions: {timestamps: true}});
