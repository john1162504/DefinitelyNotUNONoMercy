import { getSessionId } from "@/socket/socket";
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
    isYourTurn: boolean;
    canAct?: boolean;
    onPlayCard?: (cards: Card[]) => void;
    onTakeDraw?: (count: number) => void;
}

export default function GameTable({
    players,
    hostId,
    hand,
    gameState,
    isYourTurn,
    canAct,
    onPlayCard,
    onTakeDraw,
}: GameTableProps) {
    const mayAct = canAct ?? isYourTurn;
    const sessionId = getSessionId();
    const discardPile = gameState.discardPile;
    const deck = gameState.deck;

    const areaRef = useRef<HTMLDivElement>(null);
    const [area, setArea] = useState({ width: 800, height: 450 });

    useEffect(() => {
        const el = areaRef.current;
        if (!el) return;

        function updateSize() {
            if (el) {
                setArea({
                    width: el.clientWidth,
                    height: el.clientHeight,
                });
            }
        }

        updateSize();
        const ro = new ResizeObserver(updateSize);
        ro.observe(el);
        window.addEventListener("resize", updateSize);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    // Largest 16:9 oval that fits the available area, so seats/hands/center
    // all stay proportional (and don't overlap) on short/wide mobile screens.
    const ovalWidth = Math.max(
        200,
        Math.min(area.width, area.height * (16 / 9)),
    );
    const ovalHeight = ovalWidth * (9 / 16);
    const seatDiameter = Math.max(30, Math.min(78, ovalWidth * 0.09));

    const currentPlayerId =
        gameState.players[gameState.currentPlayerIndex]?.id;

    const userIdx = players.findIndex((p) => p.id === sessionId);
    const orderedPlayers =
        userIdx >= 0
            ? [...players.slice(userIdx), ...players.slice(0, userIdx)]
            : players;

    const stackActive = (gameState.pendingDrawCount ?? 0) > 0;

    return (
        <div className="relative mx-auto flex h-full w-full flex-col">
            <div
                ref={areaRef}
                className="relative flex min-h-0 w-full flex-1 items-center justify-center"
            >
                <div
                    className="relative rounded-full"
                    style={{
                        width: `${ovalWidth}px`,
                        height: `${ovalHeight}px`,
                        backgroundImage: `url('${
                            import.meta.env.BASE_URL
                        }assets/Tables/table_green.png')`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <CenterPile
                        deckCount={deck.length}
                        topDiscard={discardPile[discardPile.length - 1]}
                        lastPlayedCards={gameState.lastPlayedCards}
                        direction={gameState.direction}
                        activeColor={gameState.activeColor}
                        isYourTurn={mayAct}
                        highlightDraw={mayAct && stackActive}
                        tableWidth={ovalWidth}
                        onTakeDraw={onTakeDraw}
                    />

                    {orderedPlayers.map((player, idx) => {
                        const baseAngle = 90;
                        const angle = baseAngle + (360 / players.length) * idx;
                        const rad = (angle * Math.PI) / 180;
                        const xRadius = 46;
                        const yRadius = 42;
                        const xPercent = 50 + Math.cos(rad) * xRadius;
                        const yPercent = 50 + Math.sin(rad) * yRadius;

                        return (
                            <Fragment key={player.id}>
                                <PlayerSeat
                                    name={player.name}
                                    isYou={player.id === sessionId}
                                    isHost={player.id === hostId}
                                    isCurrentTurn={
                                        currentPlayerId === player.id
                                    }
                                    cardCount={
                                        gameState.playerCardCounter[player.id]
                                    }
                                    xPercent={xPercent}
                                    yPercent={yPercent}
                                    diameter={seatDiameter}
                                />
                                {player.id !== sessionId && (
                                    <FannedHand
                                        numCards={
                                            gameState.playerCardCounter[
                                                player.id
                                            ]
                                        }
                                        xPercent={xPercent}
                                        yPercent={yPercent}
                                        tableWidth={ovalWidth}
                                    />
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            </div>

            <div
                className={`relative w-full shrink-0 ${!mayAct ? "opacity-60 pointer-events-none" : ""}`}
            >
                <UserHand
                    hand={hand}
                    tableWidth={ovalWidth}
                    tableHeight={ovalHeight}
                    gameState={gameState}
                    isYourTurn={mayAct}
                    onPlayCard={onPlayCard}
                />
            </div>
        </div>
    );
}
