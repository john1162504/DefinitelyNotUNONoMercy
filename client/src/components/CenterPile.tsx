import { Card } from "./ui/card";
import type { Card as UNO } from "@/types";
import { RotateCcw, RotateCw } from "lucide-react";
import { getCardInfo } from "@/lib/cardInfo";

const CARD_BACK_PATH = `${
    import.meta.env.BASE_URL
}assets/Cards/individual/card back/card_back.png`;
const cardImgPath = (card: UNO) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${card.color}/${
        card.value
    }_${card.color}.png`;

interface CenterPileProps {
    deckCount: number;
    topDiscard?: UNO;
    lastPlayedCards?: UNO[];
    direction: 1 | -1;
    activeColor?: "red" | "green" | "blue" | "yellow";
    isYourTurn: boolean;
    highlightDraw?: boolean;
    tableWidth?: number;
    onTakeDraw?: (count: number) => void;
}

export default function CenterPile({
    deckCount,
    topDiscard,
    lastPlayedCards,
    direction,
    activeColor,
    isYourTurn,
    highlightDraw = false,
    tableWidth = 800,
    onTakeDraw,
}: CenterPileProps) {
    const canDraw = isYourTurn;
    const multiPlay = (lastPlayedCards?.length ?? 0) > 1;

    if (!topDiscard) {
        return (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-white/80">
                Loading table…
            </div>
        );
    }

    // Scale the pile with the table so it stays proportional on small screens.
    const cardW = Math.max(32, Math.min(72, tableWidth * 0.085));
    const cardH = cardW * 1.5;
    const gap = Math.round(cardW * 0.4);
    const arrow = Math.max(18, Math.round(cardW * 0.6));
    const playedH = cardW * 0.95;
    const playedOverlap = Math.round(cardW * 0.32);
    const highlightRing = Math.max(2, Math.round(cardW * 0.08));
    const colorDotSize = Math.max(12, Math.round(cardW * 0.22));

    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            {multiPlay && lastPlayedCards && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 flex -translate-x-1/2 items-end">
                    {lastPlayedCards.map((card, i) => {
                        const mid = (lastPlayedCards.length - 1) / 2;
                        return (
                            <img
                                key={`played-${card.color}-${card.value}-${i}`}
                                src={cardImgPath(card)}
                                alt={`${card.color} ${card.value}`}
                                draggable={false}
                                className="w-auto rounded bg-white shadow-lg"
                                style={{
                                    height: `${playedH}px`,
                                    marginLeft: i === 0 ? 0 : -playedOverlap,
                                    transform: `rotate(${(i - mid) * 8}deg)`,
                                    transformOrigin: "bottom center",
                                }}
                            />
                        );
                    })}
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                        Played x{lastPlayedCards.length}
                    </span>
                </div>
            )}
            <div className="mb-1">
                {direction === 1 ? (
                    <RotateCw
                        className="text-yellow-400 animate-spin-slow"
                        style={{ width: arrow, height: arrow }}
                    />
                ) : (
                    <RotateCcw
                        className="text-yellow-400 animate-spin-slow-reverse"
                        style={{ width: arrow, height: arrow }}
                    />
                )}
            </div>
            <div className="flex items-center" style={{ gap: `${gap}px` }}>
                <div className="flex flex-col items-center">
                    <div
                        className={`relative rounded-lg transition-transform ${
                            canDraw ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-50"
                        } ${highlightDraw ? "animate-pulse" : ""}`}
                        style={{
                            width: `${cardW}px`,
                            height: `${cardH}px`,
                            boxShadow: highlightDraw
                                ? `0 0 0 ${highlightRing}px rgb(251 146 60), 0 0 ${highlightRing * 3}px rgba(251, 146, 60, 0.45)`
                                : undefined,
                        }}
                        onClick={() => {
                            if (canDraw) onTakeDraw?.(1);
                        }}
                    >
                        <Card className="relative flex h-full w-full items-center justify-center p-0">
                            <img
                                src={CARD_BACK_PATH}
                                alt="Deck"
                                className="h-full w-full object-contain"
                                draggable={false}
                            />
                            {deckCount > 0 && (
                                <span className="absolute bottom-1 left-2 rounded bg-white/80 px-1 text-xs font-bold">
                                    {deckCount}
                                </span>
                            )}
                        </Card>
                    </div>
                    <p
                        className={`pointer-events-none mt-1 text-center text-xs font-semibold ${
                            canDraw ? "text-gray-600" : "text-gray-400"
                        }`}
                    >
                        {canDraw ? "Click to Draw" : "Not your turn"}
                    </p>
                </div>
                <div className="group relative">
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[600] mb-2 hidden w-44 -translate-x-1/2 rounded-lg bg-gray-900/95 px-3 py-2 text-left opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                        <div className="text-xs font-bold text-white">
                            {getCardInfo(topDiscard.value).name}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-gray-200">
                            {getCardInfo(topDiscard.value).description}
                        </div>
                    </div>
                    <div
                        className="relative rounded-lg"
                        style={{
                            width: `${cardW}px`,
                            height: `${cardH}px`,
                            boxShadow: activeColor
                                ? `0 0 0 ${highlightRing}px ${activeColor}, 0 0 ${highlightRing * 4}px ${activeColor}`
                                : undefined,
                        }}
                    >
                        <Card className="relative flex h-full w-full items-center justify-center p-0">
                            <img
                                src={cardImgPath(topDiscard)}
                                alt="Top discard"
                                title={`${getCardInfo(topDiscard.value).name} — ${getCardInfo(topDiscard.value).description}`}
                                className="h-full w-full object-contain"
                                draggable={false}
                            />
                            {activeColor && topDiscard.color === "wild" && (
                                <span
                                    className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow"
                                    style={{
                                        backgroundColor: activeColor,
                                        width: `${colorDotSize}px`,
                                        height: `${colorDotSize}px`,
                                        bottom: `-${Math.round(colorDotSize * 0.35)}px`,
                                    }}
                                    title={`Active: ${activeColor}`}
                                />
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
