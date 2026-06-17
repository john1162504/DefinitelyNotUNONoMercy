import type { GameState, RoomState, Card as UNO } from "../types";
import { Card } from "../components/ui/card";
import GameTable from "@/components/GameTable";
import DrawStackBanner from "@/components/DrawStackBanner";
import UnoChallengeButton from "@/components/UnoChallengeButton";
import HandSwapPicker from "@/components/HandSwapPicker";
import ActiveColorIndicator from "@/components/ActiveColorIndicator";
import { getSessionId } from "@/socket/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import getSocket from "@/socket/socket";

interface GameViewProps {
    roomId: string;
    hand: UNO[];
    gameState: GameState;
    roomState: RoomState;
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
            {gameState.pendingDrawCount ? (
                <DrawStackBanner
                    pendingDrawCount={gameState.pendingDrawCount}
                    miniumDrawValue={gameState.miniumDrawValue}
                    isYourTurn={isYourTurn}
                    currentPlayerName={currentPlayer?.name}
                />
            ) : null}

            {gameState.activeColor && (
                <div className="fixed top-20 left-4 z-40">
                    <ActiveColorIndicator activeColor={gameState.activeColor} />
                </div>
            )}

            {isYourTurn && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 font-bold text-lg animate-pulse border-2 border-green-300">
                    ✓ It's your turn!
                    {turnSecondsLeft !== null && turnSecondsLeft > 0 && (
                        <span className="ml-2 text-green-100">
                            ({turnSecondsLeft}s)
                        </span>
                    )}
                </div>
            )}

            {!isYourTurn && currentPlayer && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 font-semibold border-2 border-blue-300">
                    🎮 <span className="font-bold">{currentPlayer.name}</span>'s
                    turn
                </div>
            )}

            {!isYourTurn && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 text-gray-500 text-sm z-30">
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
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg z-40 font-semibold">
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
                <div className="fixed bottom-48 left-1/2 -translate-x-1/2 text-amber-600 text-sm font-semibold z-30">
                    After your next card, hit UNO before anyone else!
                </div>
            )}

            <div className="fixed top-4 right-4 z-40">
                <Button variant="outline" onClick={onLeave}>
                    Leave Game
                </Button>
            </div>

            <Card className="w-full max-w-5xl p-6 relative aspect-[16/9] overflow-visible mx-auto mt-[-100px]">
                <div className="relative w-full h-full">
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
            </Card>
        </>
    );
}
