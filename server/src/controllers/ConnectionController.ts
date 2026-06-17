import { Server, Socket } from "socket.io";
import { roomStates } from "./LobbyController";
import { gameStates } from "./GameController";

function handleConnection(io: Server, socket: Socket) {
    const playerId = socket.data.sessionId;

    socket.on(
        "request_current_room_state",
        ({ roomId }: { roomId: string }) => {
            const roomState = roomStates[roomId];

            if (!roomState) {
                socket.emit("error_room_not_found", {
                    message: `Room ${roomId} does not exist.`,
                });
                return;
            }

            const player = roomState.players.find((p) => p.id === playerId);

            if (!player) {
                socket.emit("error", {
                    message: `Player ${playerId} not found in room.`,
                });
                return;
            }

            player.socketId = socket.id;
            socket.join(roomId);

            const gameState = gameStates[roomId];
            if (gameState) {
                const gamePlayer = gameState.players.find(
                    (p) => p.id === playerId,
                );
                if (gamePlayer) {
                    gamePlayer.socketId = socket.id;
                }
            }

            console.log("sending room state to", playerId);
            socket.emit("current_room_state", roomState);
        },
    );

    socket.on(
        "request_current_game_state",
        ({ roomId }: { roomId: string }) => {
            const roomState = roomStates[roomId];
            const gameState = gameStates[roomId];

            if (!roomState) {
                socket.emit("error_room_not_found", {
                    message: `Room ${roomId} does not exist.`,
                });
                return;
            }

            const player = roomState.players.find((p) => p.id === playerId);
            if (!player) {
                socket.emit("error", {
                    message: `Player ${playerId} not found in room.`,
                });
                return;
            }

            player.socketId = socket.id;
            socket.join(roomId);

            if (!gameState || !roomState.isStarted) {
                socket.emit("current_room_state", roomState);
                return;
            }

            const gamePlayer = gameState.players.find((p) => p.id === playerId);
            if (gamePlayer) {
                gamePlayer.socketId = socket.id;
            }

            const { hands, ...publicGameState } = gameState;

            socket.emit("current_game_state", {
                gameState: publicGameState,
                hand: gameState.hands[playerId],
                roomState: roomState,
            });
        },
    );

    socket.on("disconnect", (reason) => {
        console.log(
            `🔴 User disconnected. sessionId: ${socket.data.sessionId}, reason: ${reason}`,
        );
    });
}

export { handleConnection };
