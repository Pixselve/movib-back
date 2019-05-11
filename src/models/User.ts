import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import MovieInteraction from './MovieInteraction';
import {arrayProp, instanceMethod, pre, prop, Typegoose} from 'typegoose';
import axios from "axios";

//Schema qui définie comment est stocké une action utilisateur (follow, view ou encore unfollow)
class Interaction {
  @prop()
  action: String;
  @prop()
  timestamp: Date;
  @prop()
  tmdbId: String;
}
//Fonction qui s'exécute avant la sauvegarde d'un utilisateur et qui permet de hasher le mot de passe de celui-ci (s'il est modifié)
@pre<User>('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
})
//Schema qui définie comment est stocké un utilisateur dans la base de données
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
  @prop({default: null})
  profilePicture?: String;
  @arrayProp({items: Interaction})
  interactionsLog: Interaction[];
  //Propriété virtuelle qui permet de récupérer la dernière action utilisateur
  @prop()
  get lastInteraction() {
    return this.interactionsLog[this.interactionsLog.length - 1];
  }

  //Methode qui permet de vérifier si un mot de passe testé est correct ou non
  @instanceMethod
  // @ts-ignore
  async comparePassword(this: InstanceType<User>, passwordToCompare: String): Promise<Boolean> {
    return await bcrypt.compare(passwordToCompare, this.password);
  }
  //Methode qui permet de générer un json web token
  @instanceMethod
  // @ts-ignore
  generateToken(this: InstanceType<User>): String {
    return jwt.sign({username: this.username}, process.env.AUTH_TOKEN, {expiresIn: '24h'});
  }

  //Methode qui permet d'obtenir des recommendation de films....
  @instanceMethod
  // @ts-ignore
  async getMovieRecommendations(this: InstanceType<User>, limit: Number) {
    try {
      const lastActivity = this.lastInteraction;
      let ids;
      //...Soit en fonction de la dernière action effectuée, s'il y en a une
      if (lastActivity) {
        const json = await axios.get(`https://api.themoviedb.org/3/movie/${lastActivity.tmdbId}/recommendations`, {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "fr",
            region: "FR",
          }
        });
        //Et si cette dernière action donne des résultats pertinents sinon......
        if (json.data.results.length < limit) {
          //...On recupère les derniers films les plus populaires
          const json = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
              api_key: process.env.TMDB_API_KEY,
              language: "fr",
              region: "FR",
            }
          });
          ids = json.data.results.map(el => el.id);
        } else {
          ids = json.data.results.map(el => el.id);
        }
      } else {
        //...On recupère les derniers films les plus populaires
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
  //Récupère les films qui sont dans la bibliothèque, mais qui n'ont pas été vus
  @instanceMethod
  // @ts-ignore
  async getNoSeenLibrary(this: InstanceType<User>, limit: number) {
    try {
      const data = await MovieInteraction.find({
        user: this._id,
        followed: true,
        watched: false
      }).sort({createdAt: 1}).limit(limit).populate("movie");
      return data;
    } catch (e) {
      throw e;
    }
  }
  //Récupère les derniers films sortis et disposants d'un backdrop
  @instanceMethod
  // @ts-ignore
  async newMovies(this: InstanceType<User>, limit: number) {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fr",
          region: "FR",
          sort_by: "primary_release_date.desc",
          "primary_release_date.lte": new Date()
        }
      });
      const filtered = response.data.results.filter(el => el.backdrop_path);
      let ids = filtered.map(el => el.id);
      ids = ids.slice(0, limit);
      return await Promise.all(ids.map(id => MovieInteraction.findOrCreate(this._id, id)));
    } catch (e) {
      throw e;
    }
  }
  //Récupère les derniers films ajoutés à la bibliothèque
  @instanceMethod
  // @ts-ignore
  async lastFollowed(this: InstanceType<User>, limit: number) {
    try {
      const data = await MovieInteraction.find({
        user: this._id,
        followed: true
      }).sort({createdAt: -1}).limit(limit).populate("movie");
      return data;
    } catch (e) {
      throw e;
    }
  }
  //Récupère l'ensemble des films présents dans la bibliothèque
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
