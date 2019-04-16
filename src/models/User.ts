import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import Movie from '@models/Movie';
import {prop, Ref, instanceMethod, arrayProp, Typegoose} from 'typegoose';

class Interaction {
  @prop()
  action: String;
  @prop()
  timestamp: Date;
  @prop()
  tmdbId: String;
}

class MovieRef {
  @prop({required: true, ref: Movie})
  movie: Ref<Movie>;
  @prop({required: true})
  watched: Boolean;
  @prop({required: true})
  followed: Boolean;
  @prop({required: true})
  rating: Number;
}

class User extends Typegoose {
  @prop({required: true})
  username: String;
  @prop({required: true})
  password: String;
  @prop({required: true})
  firstName: String;
  @prop({required: true})
  lastName: String;
  @prop({required: true})
  birthDate: Date;
  @prop({required: true})
  email: String;
  @prop()
  profilePicture?: String;
  @arrayProp({items: MovieRef})
  movie: MovieRef[];
  @arrayProp({items: Interaction})
  interactionsLog: Interaction[];

  @instanceMethod
  async comparePassword(this: InstanceType<User>, passwordToCompare: String): Promise<Boolean> {
    return await bcrypt.compare(passwordToCompare, this.password);
  }

  @instanceMethod
  generateToken(this: InstanceType<User>): String {
    return jwt.sign({username: this.username}, process.env.AUTH_TOKEN, {expiresIn: '24h'});
  }
}

export default new User().getModelForClass(User);
//
//
//
//
// const Schema = mongoose.Schema;
//
// export interface IUser extends mongoose.Document {
//   username: String
//   password: String
//   firstName: String
//   lastName: String
//   birthDate: Date
//   email: String
//   profilePicture: String
//   movies: Movie[]
//   interactionsLog: Interaction[]
// }
//
// interface Movie {
//   watched: Boolean,
//   followed: Boolean,
//   rating: Number
// }
//
// interface Interaction {
//   action: String
//   timestamp: Date
//   tmdbId: String
// }
//
// export const UserSchema = new Schema({
//   username: {type: String, required: true, index: {unique: true}},
//   password: {type: String, required: true},
//   firstName: {type: String, required: true},
//   lastName: {type: String, required: true},
//   birthDate: {type: Date, required: true},
//   email: {type: String, required: true, index: {unique: true}},
//   profilePicture: {type: String, required: false},
//   movies: [{movie: {type: Schema.Types.ObjectId, ref: 'Movie'}, watched: Boolean, followed: Boolean, rating: Number}],
//   interactionsLog: [{
//     action: {type: String, required: true},
//     timestamp: {type: Date, required: true},
//     tmdbId: {type: String, required: true}
//   }]
// }, {timestamps: true});
//
// UserSchema.pre('save', function (next) {
//   if (!this.isModified('password')) return next();
//   bcrypt.hash(this.password, 10, (err, hash) => {
//     if (err) return next(err);
//     this.password = hash;
//     next();
//   });
// });
// UserSchema.methods.comparePassword = async function (passwordToCompare) {
//   return await bcrypt.compare(passwordToCompare, this.password);
//
// };
// UserSchema.methods.generateToken = function () {
//   return jwt.sign({username: this.username}, process.env.AUTH_TOKEN, {expiresIn: '24h'});
// };
// UserSchema.methods.getMovieRecommendations = async function () {
//   try {
//     const lastActivity = this.interactionsLog[this.interactionsLog.length - 1];
//     const response = await fetch(`https://api.themoviedb.org/3/movie/${lastActivity.tmdbId}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&region=FR`);
//     if (!response.ok) throw new Error("Unable to fetch the data.");
//     const json = await response.json();
//     return json.results;
//   } catch (e) {
//     throw e;
//   }
// };
// UserSchema.methods.getMovie = async function (tmdbId: Number) {
//   try {
//     const movie = await Movie.findOne({tmdbId});
//     if (!movie) {
//
//     }
//   } catch (e) {
//
//   }
// };
// const User = mongoose.model<IUser>('User', UserSchema);
// export default User;
