import mongoose, { Schema } from "mongoose";

const lobbySchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    word: String,
    imposter: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

const Lobby = mongoose.model("Lobby", lobbySchema);

export default Lobby;
