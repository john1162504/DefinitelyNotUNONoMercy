import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import LobbyView from "../views/LobbyView";
import GameView from "../views/GameView";
import socket from "../socket/socket";
import type { RoomState, Card, GameState } from "../types";

function RoomPage() {
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const playerName = (location.state as { playerName: string })?.playerName;
    const [gameOver, setGameOver] = useState<{
        roomId: string;
        winner?: string;
        loser?: string;
    } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [hand, setHand] = useState<Card[]>([]);

    const memoisedHand = useMemo(() => hand, [hand]);

    const memoisedGameState = useMemo(() => gameState, [gameState]);

    const memoisedRoomState = useMemo(() => roomState, [roomState]);

    const playCards = useCallback(
        (cards: Card[], chosenColor?: string) => {
            if (roomId) {
                socket.emit("play_card", { roomId, cards, chosenColor });
            }
        },
        [roomId]
    );

    const takeDraw = useCallback(
        (count?: number) => {
            if (roomId) {
                socket.emit("take_draw", { roomId, count });
            }
        },
        [roomId]
    );

    const startGame = useCallback(() => {
        if (roomId) {
            socket.emit("starting_game", roomId);
        }
    }, [roomId]);

    const handleDisconnect = useCallback(() => {
        if (roomId && playerName) {
            socket.emit("leaving_room", { roomId, playerName });
        }
        setRoomState(null);
        setGameState(null);
        setHand([]);
    }, [roomId, playerName]);

    function handleBackToLobby() {
        setGameOver(null);
        setGameState(null);
        setHand([]);
    }

    useEffect(() => {
        function handleError(error: { message: string }) {
            setErrorMsg(error.message);
        }
        socket.on("error", handleError);
        return () => {
            socket.off("error", handleError);
        };
    }, []);

    useEffect(() => {
        if (roomId && playerName) {
            socket.emit("joining_room", { roomId, playerName });
        }

        const handleRoomUpdate = (roomState: RoomState) => {
            setRoomState(roomState);
        };

        socket.on("room_update", handleRoomUpdate);

        return () => {
            socket.off("room_update", handleRoomUpdate);
        };
    }, [roomId, playerName]);

    useEffect(() => {
        const handleStartGame = ({
            hand,
            gameState,
            roomState,
        }: {
            hand: Card[];
            gameState: GameState;
            roomState: RoomState;
        }) => {
            setHand(hand);
            setGameState(gameState);
            setRoomState(roomState);
        };
        socket.on("game_started", handleStartGame);

        return () => {
            socket.off("game_started", handleStartGame);
        };
    }, []);

    useEffect(() => {
        function handleGameOver(payload: {
            roomId: string;
            winner?: string;
            loser?: string;
        }) {
            setGameOver(payload);
        }
        socket.on("game_over", handleGameOver);
        return () => {
            socket.off("game_over", handleGameOver);
        };
    }, []);

    useEffect(() => {
        function handleGameUpdate({
            hand,
            gameState,
        }: {
            hand: Card[];
            gameState: GameState;
        }) {
            setHand(hand);
            setGameState(gameState);
        }

        socket.on("game_update", handleGameUpdate);

        return () => {
            socket.off("game_update", handleGameUpdate);
        };
    }, []);

    useEffect(() => {
        const handleRoomReconnect = (roomState: RoomState) => {
            setRoomState(roomState);
        };

        socket.on("current_room_state", handleRoomReconnect);
        return () => {
            socket.off("current_room_state", handleRoomReconnect);
        };
    }, []);

    useEffect(() => {
        const handleGameReconnect = ({
            gameState,
            hand,
            roomState,
        }: {
            gameState: GameState;
            hand: Card[];
            roomState: RoomState;
        }) => {
            setRoomState(roomState);
            setGameState(gameState);
            setHand(hand);
        };

        socket.on("current_game_state", handleGameReconnect);
        return () => {
            socket.off("current_game_state", handleGameReconnect);
        };
    }, []);

    useEffect(() => {
        function emitReconnect() {
            const sessionId = (socket.auth as { sessionId?: string })
                ?.sessionId;

            if (roomId && sessionId) {
                console.log("🔄 Rejoining room:", roomId);
                socket.emit("request_current_room_state", { roomId });
                socket.emit("request_current_game_state", { roomId });
            }
        }

        socket.on("connect", emitReconnect);

        return () => {
            socket.off("connect", emitReconnect);
        };
    }, [roomId]);

    useEffect(() => {
        if (!errorMsg) return;
        const timer = setTimeout(() => setErrorMsg(null), 3500);
        return () => clearTimeout(timer);
    }, [errorMsg]);

    if (!roomState) {
        console.log("no room");
        return null;
    }
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            {errorMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
                    {errorMsg}
                    <button className="ml-4" onClick={() => setErrorMsg(null)}>
                        Dismiss
                    </button>
                </div>
            )}

            {/* Show GameView if game started and not ended */}
            {memoisedRoomState?.isStarted && memoisedGameState ? (
                <GameView
                    hand={memoisedHand}
                    gameState={memoisedGameState}
                    roomId={roomId!}
                    roomState={memoisedRoomState}
                    onPlayCard={playCards}
                    onTakeDraw={takeDraw}
                />
            ) : (
                // Show lobby if not started or if gameOver is visible
                <LobbyView
                    roomState={memoisedRoomState!}
                    roomId={roomId || ""}
                    playerName={playerName || ""}
                    onStartGame={startGame}
                    handleDisconect={handleDisconnect}
                />
            )}

            {/* End Game Overlay always appears if triggered */}
            {gameOver && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
                        <h2 className="text-2xl font-bold text-center">
                            {gameOver.winner
                                ? `🎉 ${gameOver.winner} wins!`
                                : gameOver.loser
                                ? `💥 ${gameOver.loser} is busted!`
                                : "Game Over"}
                        </h2>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={handleBackToLobby}
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default RoomPage;
