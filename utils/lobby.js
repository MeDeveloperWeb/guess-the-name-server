import Lobby from "../models/lobby.js";

export const voteCount = {};

export async function createLobby(userId) {
    if (!userId) throw Error("Invalid User");

    const lobby = new Lobby({
        admin: userId,
    });

    await lobby.save();

    return lobby;
}

export async function lobbyExists(lobbyId) {
    if (!lobbyId) return false;

    const lobby = await Lobby.findById(lobbyId);

    if (!lobby) return false;
    return true;
}

export async function isUserLobbyAdmin(userId, lobbyId) {
    const lobby = await Lobby.findOne({
        _id: lobbyId,
        admin: userId,
    });

    if (lobby) return true;
    return false;
}

export function getVotingResult(voteCount, imposter) {
    let max1 = { player: null, count: 0 },
        max2 = { player: null, count: 0 };

    for (const key in voteCount) {
        const value = voteCount[key];

        value > max1.count
            ? ((max1.count = value), (max1.player = key))
            : value > max2.count && ((max2.count = value), (max2.player = key));
    }

    if (max1.count === max2.count)
        return {
            winner: "imposter",
            description: "Defending team could not find the imposter.",
            voting: "tie",
            player1: max1.player,
            player2: max2.player,
            count: max1.count,
            imposter,
        };

    if (max1.player === imposter) {
        return {
            winner: "team",
            description: "Defending team found the imposter.",
            voting: "end",
            player: max1.player,
            count: max1.count,
            imposter,
        };
    }

    console.log(max1, imposter);

    return {
        winner: "imposter",
        description: "Defending team could not find the imposter.",
        voting: "declared",
        player: max1.player,
        count: max1.count,
        imposter,
    };
}

export async function getLobbyImposter(lobbyId) {
    const lobby = await Lobby.findById(lobbyId);

    console.log(lobby);

    return lobby.imposter;
}
