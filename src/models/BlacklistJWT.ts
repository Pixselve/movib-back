import {prop, Typegoose} from 'typegoose';

//Schema qui définie comment est stocké un token blacklisté dans la base de données
export class BlacklistJWT extends Typegoose {
  @prop({required: true, unique: true}) token: String;
  @prop({required: true}) expiration: Date;
}

export default new BlacklistJWT().getModelForClass(BlacklistJWT);