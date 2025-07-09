import socket from "@/socket/socket";
import type { Card, GameState, Player } from "@/types";
import PlayerSeat from "./PlayerSeat";
import CenterPile from "./CenterPile";
import FannedHand from "./FannedHand";
import { Fragment, useRef, useState, useEffect } from "react";
import UserHand from "./UserHand";

interface GameTableProps {
    roomId: string;
    players: Player[];
    hand: Card[];
    hostId: string;
    gameState: GameState;
    onPlayCard?: (cards: Card[]) => void;
    onTakeDraw?: (count: number) => void;
}

export default function GameTable({
    players,
    hostId,
    hand,
    gameState,
    onPlayCard,
    onTakeDraw,
}: GameTableProps) {
    const discardPile = gameState.discardPile;
    const deck = gameState.deck;

    // Responsive table size state
    const tableRef = useRef<HTMLDivElement>(null);
    const [tableSize, setTableSize] = useState({ width: 800, height: 450 });

    useEffect(() => {
        function updateSize() {
            if (tableRef.current) {
                setTableSize({
                    width: tableRef.current.offsetWidth,
                    height: tableRef.current.offsetHeight,
                });
            }
        }
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    // Find the user's position and rotate the array so "you" are at the bottom
    const userIdx = players.findIndex((p) => p.id === socket.id);
    const orderedPlayers = [
        ...players.slice(userIdx),
        ...players.slice(0, userIdx),
    ];

    return (
        <div className="relative w-full aspect-[16/9] mx-auto">
            {/* Table background */}
            <div
                ref={tableRef}
                className="absolute inset-0 rounded-full"
                style={{
                    backgroundImage: "url('/assets/Tables/table_green.png')",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <CenterPile
                    deckCount={deck.length}
                    topDiscard={discardPile[discardPile.length - 1]}
                    direction={gameState.direction}
                    onTakeDraw={onTakeDraw}
                />

                {/* Other Player positions and hands */}
                {orderedPlayers.map((player, idx) => {
                    const baseAngle = 90;
                    const angle = baseAngle + (360 / players.length) * idx;
                    const rad = (angle * Math.PI) / 180;
                    const xRadius = 46;
                    const yRadius = 42;
                    const xPercent = 50 + Math.cos(rad) * xRadius; // x & y use to determind position regarding to the table
                    const yPercent = 50 + Math.sin(rad) * yRadius;

                    return (
                        <Fragment key={player.id}>
                            <PlayerSeat
                                name={player.name}
                                isYou={player.id === socket.id}
                                isHost={player.id === hostId}
                                isCurrentTurn={
                                    gameState.players[
                                        gameState.currentPlayerIndex
                                    ].id === player.id
                                }
                                xPercent={xPercent}
                                yPercent={yPercent}
                            />
                            {player.id !== socket.id && (
                                <FannedHand
                                    numCards={
                                        gameState.playerCardCounter[player.id]
                                    }
                                    xPercent={xPercent}
                                    yPercent={yPercent}
                                    tableWidth={tableSize.width}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>

            <UserHand
                hand={hand}
                tableWidth={tableSize.width}
                onPlayCard={onPlayCard}
            />
        </div>
    );
}
