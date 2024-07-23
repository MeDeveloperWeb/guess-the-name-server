import Lobby from "../models/lobby.js";
import {
    createLobby,
    getLobbyImposter,
    getVotingResult,
    isUserLobbyAdmin,
    lobbyExists,
    voteCount,
} from "../utils/lobby.js";
import {
    addUserToLobby,
    changeLobbyAdmin,
    getLobbyPlayers,
    getPlayerCountInLobby,
    getRandomUserFromLobby,
    removeUserFromLobby,
} from "../utils/user.js";
import { getRandomWord } from "../utils/word.js";

export async function handleNewLobby(userId, cb, socket) {
    try {
        const lobby = await createLobby(userId);

        const lobbyId = lobby._id.toString();

        cb(lobbyId);
    } catch (error) {
        cb(null, error);
    }
}

export async function handleLobbyJoin(userId, lobbyId, cb, socket) {
    try {
        if (!(await lobbyExists(lobbyId))) {
            cb(null, "Lobby does not exist");
            return;
        }

        const user = await addUserToLobby(lobbyId, userId);

        const players = await getLobbyPlayers(lobbyId);

        const lobbyIdStr = user.lobby.toString();

        socket.join(lobbyIdStr);

        socket.to(lobbyIdStr).emit("new_player", user);

        cb(lobbyIdStr, players);
    } catch (error) {
        console.log(error);
        cb(null, null, error);
    }
}

export async function handleGameStart(userId, lobbyId, socket) {
    try {
        if (!(await isUserLobbyAdmin(userId, lobbyId))) return;

        const [word, imposter] = await Promise.all([
            getRandomWord(),
            getRandomUserFromLobby(lobbyId),
        ]);

        await Lobby.findByIdAndUpdate(lobbyId, {
            word: word,
            imposter: imposter._id,
        });

        socket.in(lobbyId).except(imposter.socket).emit("start", false, word);

        socket.in(imposter.socket).emit("start", true);
    } catch (error) {
        console.log(error);
    }
}

export async function handleMeetingStart(userId, lobbyId, socket) {
    try {
        socket.in(lobbyId).emit("meeting_start", userId);
    } catch (error) {
        console.log(error);
    }
}

export async function handleVote(userId, votedUserId, lobbyId, socket) {
    try {
        if (!voteCount[lobbyId]) {
            voteCount[lobbyId] = { votes: {}, count: 0 };
        }
        voteCount[lobbyId]["votes"][votedUserId] =
            (voteCount[lobbyId]["votes"][votedUserId] || 0) + 1;

        voteCount[lobbyId].count++;

        socket.to(lobbyId).emit("vote", userId, votedUserId);

        const totalPlayers = await getPlayerCountInLobby(lobbyId);

        if (voteCount[lobbyId].count < totalPlayers) return;

        handleMeetingEnd(lobbyId, socket);
    } catch (error) {
        console.log(error);
    }
}

export async function handleMeetingEnd(lobbyId, socket) {
    try {
        const imposter = await getLobbyImposter(lobbyId);

        const results = getVotingResult(
            voteCount[lobbyId].votes,
            imposter.toString()
        );

        delete voteCount[lobbyId];

        socket.in(lobbyId).emit("meeting_end", results);
    } catch (error) {
        console.log(error);
    }
}

export async function handleExit(socket) {
    try {
        const user = await removeUserFromLobby(socket.id);

        const newAdmin = await changeLobbyAdmin(user.lobby);

        if (!user || !newAdmin?.id) return;

        const lobbyId = user.lobby.toString();

        socket.to(lobbyId).emit("new_lobby_admin", newAdmin.id);

        socket.to(lobbyId).emit("player_exit", user);
    } catch (error) {
        console.log(error);
    }
}
