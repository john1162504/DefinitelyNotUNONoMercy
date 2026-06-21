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
import { LogOut } from "lucide-react";
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
    const [tableWidth, setTableWidth] = useState(800);

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

            <div
                className="pointer-events-none fixed left-1.5 top-1.5 z-[120] flex max-h-[38vh] w-[min(240px,44vw)] flex-col gap-1 overflow-y-auto sm:left-2 sm:top-2 sm:w-[min(280px,36vw)] sm:gap-1.5 md:w-72"
                aria-live="polite"
            >
                {isYourTurn ? (
                    <div className="rounded-md border border-green-300/80 bg-green-600/95 px-2 py-1 text-[10px] font-bold text-white shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs">
                        ✓ Your turn
                        {turnSecondsLeft !== null && turnSecondsLeft > 0 && (
                            <span className="ml-1 font-normal text-green-100">
                                ({turnSecondsLeft}s)
                            </span>
                        )}
                    </div>
                ) : currentPlayer ? (
                    <div className="truncate rounded-md border border-blue-300/80 bg-blue-600/95 px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs">
                        🎮 {currentPlayer.name}&apos;s turn
                    </div>
                ) : null}

                {gameState.pendingDrawCount ? (
                    <DrawStackBanner
                        pendingDrawCount={gameState.pendingDrawCount}
                        minimumDrawValue={gameState.minimumDrawValue}
                        isYourTurn={isYourTurn}
                        currentPlayerName={currentPlayer?.name}
                    />
                ) : null}

                {gameState.activeColor ? (
                    <ActiveColorIndicator activeColor={gameState.activeColor} />
                ) : null}

                {!mustPickSwap && pendingSwaps > 0 && swapActor ? (
                    <div className="truncate rounded-md border border-purple-300/80 bg-purple-600/95 px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs">
                        {swapActor.name} is choosing a hand to swap…
                    </div>
                ) : null}

                <EventAnnouncer event={latestEvent ?? null} />

                {hand.length === 2 && isYourTurn && !unoChallenge ? (
                    <div className="rounded-md border border-amber-400/60 bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-200 shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs">
                        Hit UNO after your next card!
                    </div>
                ) : null}

                {!isYourTurn ? (
                    <div className="truncate text-[10px] text-gray-400 sm:text-xs">
                        Waiting for {currentPlayer?.name ?? "next player"}…
                    </div>
                ) : null}
            </div>

            {mustPickSwap && onSwapHands && (
                <HandSwapPicker
                    players={gameState.players}
                    actorId={sessionId}
                    swapsRemaining={pendingSwaps}
                    onSwap={onSwapHands}
                />
            )}

            {unoChallenge && unoTarget && (
                <UnoChallengeButton
                    xPercent={unoChallenge.xPercent}
                    yPercent={unoChallenge.yPercent}
                    targetName={unoTarget.name}
                    isTarget={unoChallenge.playerId === sessionId}
                    tableWidth={tableWidth}
                    onPress={handleCallUno}
                />
            )}

            <div className="fixed right-1.5 top-1.5 z-40 sm:right-2 sm:top-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onLeave}
                    className="h-7 w-7 border-white/20 bg-black/40 text-white hover:bg-black/60 sm:h-8 sm:w-8"
                    aria-label="Leave game"
                    title="Leave game"
                >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            <div className="fixed inset-0 z-30 flex h-[100dvh] w-full flex-col overflow-hidden px-1 pb-1 pt-1 sm:px-2 sm:pb-2 sm:pt-2">
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
                            onTableSizeChange={setTableWidth}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
