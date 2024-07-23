import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import connectDb from "./config/dbConnection.js";
import { handleNewUser, handleOldUser } from "./controller/user.js";
import {
    handleExit,
    handleGameStart,
    handleLobbyJoin,
    handleMeetingEnd,
    handleMeetingStart,
    handleNewLobby,
    handleVote,
} from "./controller/lobby.js";
import { addWord, getWord } from "./controller/word.js";
import bodyParser from "body-parser";

connectDb();

const app = express();

app.use(bodyParser.json());

app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
    },
});

io.on("connection", (socket) => {
    // socket user gets created in db
    socket.on("new_user", (username, cb) =>
        handleNewUser(username, cb, socket.id)
    );

    socket.on("old_user", (id) => handleOldUser(id, socket.id));

    socket.on("create_lobby", (userId, cb) =>
        handleNewLobby(userId, cb, socket)
    );

    socket.on("join_lobby", (userId, lobbyId, cb) =>
        handleLobbyJoin(userId, lobbyId, cb, socket)
    );

    socket.on("start_game", (userId, lobbyId) =>
        handleGameStart(userId, lobbyId, io)
    );

    socket.on("meeting_start", (userId, lobbyId) =>
        handleMeetingStart(userId, lobbyId, io)
    );

    socket.on("vote", (userId, votedUserId, lobbyId) =>
        handleVote(userId, votedUserId, lobbyId, io)
    );

    socket.on("meeting_end", (lobbyId) => handleMeetingEnd(lobbyId, io));

    // socket.on("leave_game", (id) => {});

    console.log("a user connected");

    socket.on("disconnect", () => handleExit(socket));
});

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

app.post("/words", addWord);
app.get("/words", getWord);

server.listen(process.env.PORT || 8000, () => {
    console.log("server running at http://localhost:3000");
});
