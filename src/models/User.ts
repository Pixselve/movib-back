import mongoose = require("mongoose");

const bcrypt = require('bcrypt');


const jwt = require('jsonwebtoken');

export interface IUser extends mongoose.Document {
  username: String
  password: String
  firstName: String
  lastName: String
  birthDate: Date
  email: String
  profilePicture: String
}

export const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  birthDate: {type: Date, required: true},
  email: {type: String, required: true, index: {unique: true}},
  profilePicture: {type: String, required: false},
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});
UserSchema.methods.comparePassword = async function (passwordToCompare) {
  return await bcrypt.compare(passwordToCompare, this.password);

};
UserSchema.methods.generateToken = function ()  {
  return jwt.sign({username: this.username}, process.env.AUTH_TOKEN, {expiresIn: '24h'});
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
