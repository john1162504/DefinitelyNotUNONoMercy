"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomStates = void 0;
exports.handleRoomSockets = handleRoomSockets;
const GameController_1 = require("./GameController");
const roomStates = {};
exports.roomStates = roomStates;
function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function handleRoomSockets(io, socket) {
    socket.on("creating_room", ({ playerName, gameRule, }) => {
        const roomId = generateRoomId();
        const player = {
            id: socket.id,
            name: playerName,
        };
        const roomState = {
            host: socket.id,
            players: [],
            rule: gameRule,
            isStarted: false,
        };
        roomStates[roomId] = roomState;
        socket.join(roomId);
        console.log(`🎯 Room created: ${roomId} by ${playerName}`);
        socket.emit("room_created", {
            roomId,
            players: roomStates[roomId].players,
            gameRule,
        });
    });
    socket.on("joining_room", ({ roomId, playerName }) => {
        console.log("join_room");
        if (!roomStates[roomId]) {
            socket.emit("error_room_not_found", {
                message: `Room ${roomId} does not exist.`,
            });
            return;
        }
        if (roomStates[roomId].players.some((p) => p.id === socket.id)) {
            return;
        }
        const newPlayer = { id: socket.id, name: playerName };
        roomStates[roomId].players.push(newPlayer);
        console.log(roomStates[roomId].players);
        socket.join(roomId);
        io.to(roomId).emit("room_update", roomStates[roomId]);
        console.log(`${playerName} joined room ${roomId}`);
    });
    socket.on("starting_game", (roomId) => {
        console.log("starting_game");
        let roomState = roomStates[roomId];
        if (roomState.isStarted) {
            socket.emit("error_game_start", {
                message: "Game has already started",
            });
            return;
        }
        if (roomState.players.length < 2) {
            socket.emit("error_game_start", {
                message: "Need at least 2 players to start",
            });
            return;
        }
        (0, GameController_1.startGame)(io, roomState, roomId);
        roomState.isStarted = true;
        io.to(roomId).emit("room_update", roomState);
        console.log(`Room ${roomId}: Game started`);
    });
    socket.on("leaving_room", () => {
        for (const roomId in roomStates) {
            const updatedPlayers = roomStates[roomId].players.filter((p) => p.id !== socket.id);
            if (updatedPlayers.length === 0) {
                delete roomStates[roomId];
                console.log(`🧹 Room ${roomId} deleted due to no players.`);
            }
            else {
                roomStates[roomId].players = updatedPlayers;
                io.to(roomId).emit("room_update", roomStates[roomId]);
            }
        }
        console.log(`Socket ${socket.id} disconnected`);
    });
}
