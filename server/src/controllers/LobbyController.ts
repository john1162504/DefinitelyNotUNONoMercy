import { Server, Socket } from "socket.io";
import { Player, GameRule, RoomState } from "../models/types";
import { startGame, handlePlayerLeaveMidGame } from "./GameController";

const roomStates: Record<string, RoomState> = {};

function generateRoomId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalizeGameRule(
    gameRule: GameRule & { secondsPerRound?: number },
): GameRule {
    const legacySpecial = gameRule.specialRulesIsEnabled ?? false;
    const rotateHandsOnZero =
        gameRule.rotateHandsOnZero ?? legacySpecial ?? false;
    const swapHandsOnSeven =
        gameRule.swapHandsOnSeven ?? legacySpecial ?? false;

    return {
        ...gameRule,
        secondsPerRound:
            gameRule.secondsPerRound ?? gameRule.secondPerRound ?? 30,
        secondPerRound:
            gameRule.secondsPerRound ?? gameRule.secondPerRound ?? 30,
        allowWinOnFunctionCard: gameRule.allowWinOnFunctionCard ?? true,
        rotateHandsOnZero,
        swapHandsOnSeven,
        specialRulesIsEnabled: rotateHandsOnZero || swapHandsOnSeven,
    };
}

function handleRoomSockets(io: Server, socket: Socket) {
    socket.on(
        "creating_room",
        ({
            playerName,
            gameRule,
        }: {
            playerName: string;
            gameRule: GameRule & { secondsPerRound?: number };
        }) => {
            const roomId = generateRoomId();

            const player: Player = {
                id: socket.data.sessionId,
                socketId: socket.id,
                name: playerName,
            };
            const normalizedRule = normalizeGameRule(gameRule);
            const roomState: RoomState = {
                host: socket.data.sessionId,
                players: [player],
                rule: normalizedRule,
                isStarted: false,
            };
            roomStates[roomId] = roomState;
            socket.join(roomId);

            console.log(`🎯 Room created: ${roomId} by ${playerName}`);

            socket.emit("room_created", {
                roomId,
                players: roomState.players,
                gameRule: normalizedRule,
            });
            socket.emit("room_update", roomState);
        },
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

            const existing = roomStates[roomId].players.find(
                (p) => p.id === socket.data.sessionId,
            );
            if (existing) {
                existing.socketId = socket.id;
                socket.join(roomId);
                socket.emit("room_update", roomStates[roomId]);
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
        },
    );

    socket.on("starting_game", (roomId) => {
        console.log("starting_game");
        const roomState = roomStates[roomId];

        if (!roomState) {
            socket.emit("error_game_start", {
                message: "Room not found",
            });
            return;
        }

        if (roomState.host !== socket.data.sessionId) {
            socket.emit("error_game_start", {
                message: "Only the host can start the game",
            });
            return;
        }

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
        startGame(io, roomState, roomId);

        console.log(`Room ${roomId}: Game started`);
    });

    socket.on("leaving_room", ({ roomId, playerName }) => {
        console.log(`🚪 ${playerName} left room ${roomId}`);

        const roomState = roomStates[roomId];
        if (!roomState) {
            return;
        }

        const sessionId = socket.data.sessionId;
        const wasInGame = roomState.isStarted;

        roomState.players = roomState.players.filter(
            (p) => p.id !== sessionId,
        );
        socket.leave(roomId);

        if (wasInGame) {
            handlePlayerLeaveMidGame(io, roomId, sessionId);
        }

        if (roomState.players.length === 0) {
            delete roomStates[roomId];
            console.log(`🧹 Room ${roomId} deleted due to no players.`);
        } else {
            if (roomState.host === sessionId) {
                roomState.host = roomState.players[0].id;
            }
            io.to(roomId).emit("room_update", roomState);
        }

        console.log(`Socket ${sessionId} left room ${roomId}`);
    });
}

export { handleRoomSockets, roomStates };
