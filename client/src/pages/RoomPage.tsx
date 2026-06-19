import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import LobbyView from "../views/LobbyView";
import GameView from "../views/GameView";
import OrientationGate from "../components/OrientationGate";
import getSocket from "../socket/socket";
import type { RoomState, Card, GameState, GameEvent } from "../types";

export type TimedGameEvent = GameEvent & { eventId: number };

function RoomPage() {
    const socket = getSocket();
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
    const [latestEvent, setLatestEvent] = useState<TimedGameEvent | null>(null);
    const eventCounterRef = useRef(0);

    const memoisedHand = useMemo(() => hand, [hand]);
    const memoisedGameState = useMemo(() => gameState, [gameState]);
    const memoisedRoomState = useMemo(() => roomState, [roomState]);

    const showError = useCallback((message: string) => {
        setErrorMsg(message);
    }, []);

    const playCards = useCallback(
        (cards: Card[], chosenColor?: string) => {
            if (roomId) {
                socket.emit("play_card", { roomId, cards, chosenColor });
            }
        },
        [roomId, socket],
    );

    const takeDraw = useCallback(
        (count?: number) => {
            if (roomId) {
                socket.emit("take_draw", { roomId, count });
            }
        },
        [roomId, socket],
    );

    const swapHands = useCallback(
        (targetPlayerId: string) => {
            if (roomId) {
                socket.emit("swap_hands", { roomId, targetPlayerId });
            }
        },
        [roomId, socket],
    );

    const startGame = useCallback(() => {
        if (roomId) {
            socket.emit("starting_game", roomId);
        }
    }, [roomId, socket]);

    const handleDisconnect = useCallback(() => {
        if (roomId && playerName) {
            socket.emit("leaving_room", { roomId, playerName });
        }
        navigate("/");
    }, [roomId, playerName, navigate, socket]);

    function handleBackToLobby() {
        setGameOver(null);
        setGameState(null);
        setHand([]);
    }

    useEffect(() => {
        function handleError(error: { message: string }) {
            showError(error.message);
        }
        function handleGameStartError(error: { message: string }) {
            showError(error.message);
        }
        function handleRoomNotFound(error: { message: string }) {
            showError(error.message);
            setTimeout(() => navigate("/"), 2500);
        }

        socket.on("error", handleError);
        socket.on("error_game_start", handleGameStartError);
        socket.on("error_room_not_found", handleRoomNotFound);

        return () => {
            socket.off("error", handleError);
            socket.off("error_game_start", handleGameStartError);
            socket.off("error_room_not_found", handleRoomNotFound);
        };
    }, [socket, showError, navigate]);

    useEffect(() => {
        if (roomId && playerName) {
            socket.emit("joining_room", { roomId, playerName });
            socket.emit("request_current_room_state", { roomId });
            socket.emit("request_current_game_state", { roomId });
        }

        const handleRoomUpdate = (updated: RoomState) => {
            setRoomState(updated);
            if (!updated.isStarted) {
                setGameState(null);
                setHand([]);
            }
        };

        socket.on("room_update", handleRoomUpdate);

        return () => {
            socket.off("room_update", handleRoomUpdate);
        };
    }, [roomId, playerName, socket]);

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
            setGameOver(null);
        };
        socket.on("game_started", handleStartGame);

        return () => {
            socket.off("game_started", handleStartGame);
        };
    }, [socket]);

    useEffect(() => {
        function handleGameOver(payload: {
            roomId: string;
            winner?: string;
            loser?: string;
        }) {
            setGameOver(payload);
            setGameState(null);
            setHand([]);
        }
        socket.on("game_over", handleGameOver);
        return () => {
            socket.off("game_over", handleGameOver);
        };
    }, [socket]);

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
    }, [socket]);

    useEffect(() => {
        const handleRoomReconnect = (updated: RoomState) => {
            setRoomState(updated);
            if (!updated.isStarted) {
                setGameState(null);
                setHand([]);
            }
        };

        socket.on("current_room_state", handleRoomReconnect);
        return () => {
            socket.off("current_room_state", handleRoomReconnect);
        };
    }, [socket]);

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
            setGameOver(null);
        };

        socket.on("current_game_state", handleGameReconnect);
        return () => {
            socket.off("current_game_state", handleGameReconnect);
        };
    }, [socket]);

    useEffect(() => {
        function handleGameEvent(event: GameEvent) {
            eventCounterRef.current += 1;
            setLatestEvent({ ...event, eventId: eventCounterRef.current });
        }
        socket.on("game_event", handleGameEvent);
        return () => {
            socket.off("game_event", handleGameEvent);
        };
    }, [socket]);

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
    }, [roomId, socket]);

    useEffect(() => {
        if (!errorMsg) return;
        const timer = setTimeout(() => setErrorMsg(null), 4000);
        return () => clearTimeout(timer);
    }, [errorMsg]);

    if (!roomState) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold">Loading room...</p>
                </div>
            </main>
        );
    }

    const inGame =
        memoisedRoomState!.isStarted &&
        memoisedGameState &&
        !gameOver;

    return (
        <main className="min-h-screen w-full overflow-y-auto">
            {errorMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-3 rounded shadow-lg z-50 max-w-sm">
                    <p className="mb-2">{errorMsg}</p>
                    <button
                        className="text-sm underline hover:no-underline"
                        onClick={() => setErrorMsg(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {inGame && <OrientationGate />}

            {inGame ? (
                <GameView
                    hand={memoisedHand}
                    gameState={memoisedGameState!}
                    roomId={roomId!}
                    roomState={memoisedRoomState!}
                    latestEvent={latestEvent}
                    onPlayCard={playCards}
                    onTakeDraw={takeDraw}
                    onSwapHands={swapHands}
                    onLeave={handleDisconnect}
                />
            ) : (
                <div className="flex min-h-screen items-center justify-center px-4 py-6">
                    <LobbyView
                        roomState={memoisedRoomState!}
                        roomId={roomId || ""}
                        playerName={playerName || ""}
                        onStartGame={startGame}
                        handleDisconect={handleDisconnect}
                    />
                </div>
            )}

            {gameOver && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 max-w-sm">
                        <h2 className="text-2xl font-bold text-center">
                            {gameOver.winner
                                ? `🎉 ${gameOver.winner} wins!`
                                : gameOver.loser
                                  ? `💥 ${gameOver.loser} is busted!`
                                  : "Game Over"}
                        </h2>
                        <button
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
