import type { GameState, RoomState, Card as UNO } from "../types";
import type { TimedGameEvent } from "../pages/RoomPage";
import GameTable from "@/components/GameTable";
import DrawStackBanner from "@/components/DrawStackBanner";
import UnoChallengeButton from "@/components/UnoChallengeButton";
import HandSwapPicker from "@/components/HandSwapPicker";
import ActiveColorIndicator from "@/components/ActiveColorIndicator";
import RouletteOverlay from "@/components/RouletteOverlay";
import EventAnnouncer from "@/components/EventAnnouncer";
import { getSessionId } from "@/socket/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import getSocket from "@/socket/socket";

interface GameViewProps {
    roomId: string;
    hand: UNO[];
    gameState: GameState;
    roomState: RoomState;
    latestEvent?: TimedGameEvent | null;
    onPlayCard?: (cards: UNO[]) => void;
    onTakeDraw?: (count: number) => void;
    onSwapHands?: (targetPlayerId: string) => void;
    onLeave?: () => void;
}

export default function GameView({
    roomId,
    hand,
    gameState,
    roomState,
    latestEvent,
    onPlayCard,
    onTakeDraw,
    onSwapHands,
    onLeave,
}: GameViewProps) {
    const socket = getSocket();
    const sessionId = getSessionId();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isYourTurn = currentPlayer?.id === sessionId;
    const [turnSecondsLeft, setTurnSecondsLeft] = useState<number | null>(
        null,
    );

    const unoChallenge = gameState.unoChallenge;
    const unoTarget = unoChallenge
        ? gameState.players.find((p) => p.id === unoChallenge.playerId)
        : undefined;

    const pendingSwaps = gameState.pendingHandSwaps ?? 0;
    const mustPickSwap =
        pendingSwaps > 0 && gameState.handSwapPlayerId === sessionId;
    const swapActor = gameState.handSwapPlayerId
        ? gameState.players.find((p) => p.id === gameState.handSwapPlayerId)
        : undefined;

    useEffect(() => {
        if (!isYourTurn || !gameState.turnExpiresAt) {
            setTurnSecondsLeft(null);
            return;
        }

        const tick = () => {
            const remaining = Math.max(
                0,
                Math.ceil((gameState.turnExpiresAt! - Date.now()) / 1000),
            );
            setTurnSecondsLeft(remaining);
        };

        tick();
        const interval = setInterval(tick, 250);
        return () => clearInterval(interval);
    }, [gameState.turnExpiresAt, isYourTurn]);

    const handleCallUno = () => {
        socket.emit("call_uno", { roomId });
    };

    return (
        <>
            <RouletteOverlay event={latestEvent ?? null} />
            <EventAnnouncer event={latestEvent ?? null} />

            {gameState.pendingDrawCount ? (
                <DrawStackBanner
                    pendingDrawCount={gameState.pendingDrawCount}
                    minimumDrawValue={gameState.minimumDrawValue}
                    isYourTurn={isYourTurn}
                    currentPlayerName={currentPlayer?.name}
                />
            ) : null}

            {gameState.activeColor && (
                <div className="fixed top-14 left-2 sm:top-20 sm:left-4 z-40">
                    <ActiveColorIndicator activeColor={gameState.activeColor} />
                </div>
            )}

            {isYourTurn && (
                <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl z-40 font-bold text-xs sm:text-lg animate-pulse border border-green-300 sm:border-2 whitespace-nowrap">
                    ✓ It's your turn!
                    {turnSecondsLeft !== null && turnSecondsLeft > 0 && (
                        <span className="ml-1 sm:ml-2 text-green-100">
                            ({turnSecondsLeft}s)
                        </span>
                    )}
                </div>
            )}

            {!isYourTurn && currentPlayer && (
                <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl z-40 font-semibold text-xs sm:text-base border border-blue-300 sm:border-2 whitespace-nowrap max-w-[60vw] truncate">
                    🎮 <span className="font-bold">{currentPlayer.name}</span>'s
                    turn
                </div>
            )}

            {!isYourTurn && (
                <div className="fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 text-gray-300 text-xs sm:text-sm z-30 whitespace-nowrap">
                    Waiting for {currentPlayer?.name ?? "next player"}…
                </div>
            )}

            {mustPickSwap && onSwapHands && (
                <HandSwapPicker
                    players={gameState.players}
                    actorId={sessionId}
                    swapsRemaining={pendingSwaps}
                    onSwap={onSwapHands}
                />
            )}

            {!mustPickSwap && pendingSwaps > 0 && swapActor && (
                <div className="fixed top-16 sm:top-24 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl shadow-lg z-40 font-semibold text-xs sm:text-base whitespace-nowrap max-w-[80vw] truncate text-center">
                    {swapActor.name} is choosing a hand to swap…
                </div>
            )}

            {unoChallenge && unoTarget && (
                <UnoChallengeButton
                    xPercent={unoChallenge.xPercent}
                    yPercent={unoChallenge.yPercent}
                    targetName={unoTarget.name}
                    isTarget={unoChallenge.playerId === sessionId}
                    onPress={handleCallUno}
                />
            )}

            {hand.length === 2 && isYourTurn && !unoChallenge && (
                <div className="fixed bottom-44 sm:bottom-48 left-1/2 -translate-x-1/2 text-amber-400 text-xs sm:text-sm font-semibold z-30 whitespace-nowrap text-center max-w-[90vw]">
                    After your next card, hit UNO before anyone else!
                </div>
            )}

            <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 flex gap-1.5 sm:gap-2">
                <Button
                    variant="outline"
                    onClick={() =>
                        window.open(
                            `${import.meta.env.BASE_URL}rules`,
                            "_blank",
                        )
                    }
                    className="h-8 px-2 text-xs sm:h-9 sm:px-4 sm:text-sm"
                >
                    How to play
                </Button>
                <Button
                    variant="outline"
                    onClick={onLeave}
                    className="h-8 px-2 text-xs sm:h-9 sm:px-4 sm:text-sm"
                >
                    Leave Game
                </Button>
            </div>

            <div className="fixed inset-0 z-30 flex h-[100dvh] w-full flex-col overflow-hidden px-2 pb-2 pt-16 sm:pt-20">
                <div className="flex min-h-0 w-full flex-1 items-stretch justify-center">
                    <div className="relative flex h-full min-h-0 w-full max-w-5xl flex-col">
                        <GameTable
                            roomId={roomId}
                            players={roomState.players}
                            hand={hand}
                            hostId={roomState.host}
                            gameState={gameState}
                            isYourTurn={isYourTurn}
                            canAct={isYourTurn && !mustPickSwap}
                            onPlayCard={onPlayCard}
                            onTakeDraw={onTakeDraw}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
