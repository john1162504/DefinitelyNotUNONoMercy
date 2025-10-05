import { Server, Socket } from "socket.io";
import { Player, GameRule, RoomState } from "../models/types";
import { startGame } from "./GameController";

const roomStates: Record<string, RoomState> = {};
function generateRoomId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function handleRoomSockets(io: Server, socket: Socket) {
    socket.on(
        "creating_room",
        ({
            playerName,
            gameRule,
        }: {
            playerName: string;
            gameRule: GameRule;
        }) => {
            const roomId = generateRoomId();

            const player: Player = {
                id: socket.data.sessionId,
                socketId: socket.id,
                name: playerName,
            };
            const roomState: RoomState = {
                host: socket.data.sessionId,
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
        }
    );

    socket.on(
        "joining_room",
        ({ roomId, playerName }: { roomId: string; playerName: string }) => {
            console.log("join_room");
            if (!roomStates[roomId]) {
                socket.emit("error_room_not_found", {
                    message: `Room ${roomId} does not exist.`,
                });
                return;
            }

            if (
                roomStates[roomId].players.some(
                    (p) => p.id === socket.data.sessionId
                )
            ) {
                return;
            }
            const newPlayer = {
                id: socket.data.sessionId,
                socketId: socket.id,
                name: playerName,
            };
            roomStates[roomId].players.push(newPlayer);
            socket.join(roomId);
            io.to(roomId).emit("room_update", roomStates[roomId]);

            console.log(`${playerName} joined room ${roomId}`);
        }
    );

    socket.on("starting_game", (roomId) => {
        console.log("starting_game");
        let roomState = roomStates[roomId];

        if (roomState?.isStarted) {
            socket.emit("error_game_start", {
                message: "Game has already started",
            });
            return;
        }

        if (roomState?.players.length < 2) {
            socket.emit("error_game_start", {
                message: "Need at least 2 players to start",
            });
            return;
        }
        startGame(io, roomState, roomId);

        // io.to(roomId).emit("room_update", roomState);
        console.log(`Room ${roomId}: Game started`);
    });

    socket.on("leaving_room", ({ roomId, playerName }) => {
        console.log(`🚪 ${playerName} left room ${roomId}`);
        for (const roomId in roomStates) {
            const updatedPlayers = roomStates[roomId].players.filter(
                (p) => p.id !== socket.data.sessionId
            );

            socket.leave(roomId);

            if (updatedPlayers.length === 0) {
                delete roomStates[roomId];
                console.log(`🧹 Room ${roomId} deleted due to no players.`);
            } else {
                roomStates[roomId].players = updatedPlayers;
                io.to(roomId).emit("room_update", roomStates[roomId]);
            }
        }

        console.log(`Socket ${socket.data.sessionId} disconnected`);
    });
}

export { handleRoomSockets, roomStates };
