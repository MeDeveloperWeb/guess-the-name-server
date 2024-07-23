import { Types } from "mongoose";
import Lobby from "../models/lobby.js";
import User from "../models/user.js";

export async function createUser(username, socketId) {
    if (!username || !socketId) throw Error("Invalid User");

    const user = new User({ username, socket: socketId });
    await user.save();
    return user;
}

export async function updateUserSocket(id, socketId) {
    if (!socketId || !id) throw Error("Invalid User");

    const user = await User.findByIdAndUpdate(id, { socket: socketId });

    return user;
}

export async function addUserToLobby(lobbyId, userId) {
    if (!userId || !lobbyId) throw Error("Invalid User");

    const user = await User.findByIdAndUpdate(
        userId,
        {
            lobby: lobbyId,
        },
        { new: true }
    );

    return user;
}

export async function getLobbyPlayers(lobbyId) {
    if (!lobbyId) return "Invalid lobby";

    const players = await User.find({ lobby: lobbyId });

    return players;
}

export async function removeUserFromLobby(socketId) {
    if (!socketId) throw Error("Invalid User");

    const user = await User.findOneAndUpdate(
        { socket: socketId },
        { lobby: null }
    );

    if (!user) return null;

    return user;
}

export async function changeLobbyAdmin(lobbyId) {
    if (!lobbyId) throw Error("Invalid User");

    const newAdmin = await User.findOne({ lobby: lobbyId });

    const lobby = await Lobby.findByIdAndUpdate(lobbyId, {
        admin: newAdmin._id,
    });

    // If No players in lobby
    // if (!newAdmin) {
    //     console.log("deleted");
    //     await Lobby.findByIdAndDelete(user.lobby);
    // }

    return newAdmin;
}

export async function getRandomUserFromLobby(lobbyId) {
    const id = Types.ObjectId.createFromHexString(lobbyId);

    const user = await User.aggregate([
        { $match: { lobby: id } },
        { $sample: { size: 1 } },
    ]);

    if (!user) return null;

    return user[0];
}

export async function getPlayerCountInLobby(lobbyId) {
    const count = await User.countDocuments({ lobby: lobbyId });

    console.log(count);

    return count;
}
