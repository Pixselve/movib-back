import mongoose = require("mongoose");

export interface IGenre extends mongoose.Document {
  name: string;
  id: number;
}

export const GenreSchema = new mongoose.Schema({
  name: {type: String, required: true},
  id: {type: Number, required: true},
});

const Genre = mongoose.model<IGenre>('Genre', GenreSchema);
export default Genre;
