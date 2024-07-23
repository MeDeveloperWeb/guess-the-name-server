import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: String, // String is shorthand for {type: String}
    socket: String,
    lobby: {
        type: Schema.Types.ObjectId,
        ref: "Lobby",
    },
});

const User = mongoose.model("User", userSchema);

export default User;
