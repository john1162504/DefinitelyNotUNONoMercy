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
                socket.emit("error", {
                    message: `Room ${roomId} does not exist.`,
                });
                return;
            }

            const player = roomState.players.find((p) => p.id === playerId);

            if (!player) {
                socket.emit("error", {
                    message: `Player ${playerId} not found.`,
                });
                return;
            } else {
                player.socketId = socket.id;
                console.log(
                    `🔄 Player ${playerId} reconnected with new socketId ${socket.id}`
                );
            }

            const gameState = gameStates[roomId];

            if (gameState) {
                const gamePlayer = gameState.players.find(
                    (p) => p.id === playerId
                );
                if (gamePlayer) {
                    gamePlayer.socketId = socket.id;
                }
            }

            console.log("sending room state to", playerId);
            // Send the raw roomState (not wrapped in { roomState: ... })
            socket.emit("current_room_state", roomState);
        }
    );

    socket.on(
        "request_current_game_state",
        ({ roomId }: { roomId: string }) => {
            const gameState = gameStates[roomId];
            const roomState = roomStates[roomId];

            if (!roomState || !gameState) {
                socket.emit("error", {
                    message: `Game ${roomId} does not exist.`,
                });
                return;
            }

            const player = roomState.players.find((p) => p.id === playerId);
            if (!player) {
                socket.emit("error", {
                    message: `Player ${playerId} not found.`,
                });
                return;
            }

            player.socketId = socket.id;
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
        }
    );

    socket.on("disconnect", (reason) => {
        console.log(
            `🔴 User disconnected. sessionId: ${socket.data.sessionId}, reason: ${reason}`
        );
    });
}

export { handleConnection };
