import type { GameState, RoomState, Card as UNO } from "../types";
import { Card } from "../components/ui/card";
import GameTable from "@/components/GameTable";
import socket from "@/socket/socket";
import { useEffect, useState } from "react";

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
    const [showTurnMessage, setShowTurnMessage] = useState(false);

    useEffect(() => {
        if (gameState.players[gameState.currentPlayerIndex]?.id === socket.id) {
            setShowTurnMessage(true);
            const timer = setTimeout(() => setShowTurnMessage(false), 2000); // auto-dismiss after 2s
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    return (
        <>
            {showTurnMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
                    It's your turn!
                </div>
            )}

            <Card className="w-full max-w-5xl p-6 relative aspect-[16/9] overflow-visible">
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
