import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import MovieInteraction from './MovieInteraction';
import {arrayProp, instanceMethod, prop, pre, Typegoose} from 'typegoose';
import axios from "axios";


class Interaction {
  @prop()
  action: String;
  @prop()
  timestamp: Date;
  @prop()
  tmdbId: String;
}

@pre<User>('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
})
export class User extends Typegoose {
  @prop({required: true, lowercase: true, unique: true})
  username: String;
  @prop({required: true})
  password: String;
  @prop({required: true})
  firstName: String;
  @prop({required: true})
  lastName: String;
  @prop({required: true})
  birthDate: Date;
  @prop({required: true, lowercase: true, unique: true})
  email: String;
  @prop()
  profilePicture?: String;
  @arrayProp({items: Interaction})
  interactionsLog: Interaction[];

  @prop()
  get lastInteraction() {
    return this.interactionsLog[this.interactionsLog.length - 1];
  }


  @instanceMethod
  // @ts-ignore
  async comparePassword(this: InstanceType<User>, passwordToCompare: String): Promise<Boolean> {
    return await bcrypt.compare(passwordToCompare, this.password);
  }

  @instanceMethod
  // @ts-ignore
  generateToken(this: InstanceType<User>): String {
    return jwt.sign({username: this.username}, process.env.AUTH_TOKEN, {expiresIn: '24h'});
  }


  @instanceMethod
  // @ts-ignore
  async getMovieRecommendations(this: InstanceType<User>, limit: Number) {
    try {
      const lastActivity = this.lastInteraction;
      let ids;
      if (lastActivity) {
        const json = await axios.get(`https://api.themoviedb.org/3/movie/${lastActivity.tmdbId}/recommendations`, {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "fr",
            region: "FR",
          }
        });
        ids = json.data.results.map(el => el.id);
      } else {
        const json = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "fr",
            region: "FR",
          }
        });
        ids = json.data.results.map(el => el.id);
      }
      ids = ids.slice(0, limit);
      return await Promise.all(ids.map(id => MovieInteraction.findOrCreate(this._id, id)));
    } catch (e) {
      throw e;
    }
  }

  @instanceMethod
  // @ts-ignore
  async getLibrary(this: InstanceType<User>) {
    try {
      const data = await MovieInteraction.find({user: this._id, followed: true}).populate("movie");
      return data;
    } catch (e) {
      throw e;
    }
  }

}


export default new User().getModelForClass(User);
