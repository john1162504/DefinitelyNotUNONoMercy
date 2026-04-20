import type { GameState, RoomState, Card as UNO } from "../types";
import { Card } from "../components/ui/card";
import GameTable from "@/components/GameTable";
import socket from "@/socket/socket";
import { useEffect } from "react";

interface GameViewProps {
    roomId: string;
    hand: UNO[];
    gameState: GameState;
    roomState: RoomState;
    onPlayCard?: (cards: UNO[]) => void;
    onTakeDraw?: (count: number) => void;
}

export default function GameView({
    roomId,
    hand,
    gameState,
    roomState,
    onPlayCard,
    onTakeDraw,
}: GameViewProps) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isYourTurn = currentPlayer?.id === socket.id;

    useEffect(() => {
        if (isYourTurn) {
            const timer = setTimeout(() => {}, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentPlayerIndex, isYourTurn]);

    return (
        <>
            {/* Your turn indicator */}
            {isYourTurn && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 font-bold text-lg animate-pulse border-2 border-green-300">
                    ✓ It's your turn! Play now!
                </div>
            )}

            {/* Opponent's turn indicator */}
            {!isYourTurn && currentPlayer && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-40 font-semibold animate-bounce border-2 border-blue-300">
                    🎮 <span className="font-bold">{currentPlayer.name}</span>'s
                    turn
                </div>
            )}

            <Card className="w-full max-w-5xl p-6 relative aspect-[16/9] overflow-visible mx-auto mt-[-100px]">
                <div className="relative w-full h-full">
                    <GameTable
                        roomId={roomId}
                        players={roomState.players}
                        hand={hand}
                        hostId={roomState.host}
                        gameState={gameState}
                        onPlayCard={onPlayCard}
                        onTakeDraw={onTakeDraw}
                    />
                </div>
            </Card>
        </>
    );
}
