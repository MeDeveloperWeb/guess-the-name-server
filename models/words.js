import mongoose, { Schema } from "mongoose";

const wordSchema = new Schema({
    word: String,
});

const Word = mongoose.model("Word", wordSchema);

export default Word;
