import { Card } from "./ui/card";
import type { Card as UNO } from "@/types";
import { RotateCcw, RotateCw } from "lucide-react";

const CARD_BACK_PATH = `${
    import.meta.env.BASE_URL
}assets/Cards/individual/card back/card_back.png`;
const cardImgPath = (card: UNO) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${card.color}/${
        card.value
    }_${card.color}.png`;

interface CenterPileProps {
    deckCount: number;
    topDiscard: UNO;
    direction: 1 | -1;
    activeColor?: "red" | "green" | "blue" | "yellow";
    isYourTurn: boolean;
    highlightDraw?: boolean;
    onTakeDraw?: (count: number) => void;
}

export default function CenterPile({
    deckCount,
    topDiscard,
    direction,
    activeColor,
    isYourTurn,
    highlightDraw = false,
    onTakeDraw,
}: CenterPileProps) {
    const canDraw = isYourTurn;

    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="mb-2">
                {direction === 1 ? (
                    <RotateCw className="w-10 h-10 text-yellow-400 animate-spin-slow" />
                ) : (
                    <RotateCcw className="w-10 h-10 text-yellow-400 animate-spin-slow-reverse" />
                )}
            </div>
            <div className="flex gap-6 items-center">
                <div
                    className={`group ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-50"} ${
                        highlightDraw
                            ? "ring-4 ring-orange-400 rounded-lg animate-pulse"
                            : ""
                    }`}
                    onClick={() => {
                        if (canDraw) onTakeDraw?.(1);
                    }}
                >
                    <Card className="w-16 h-24 flex items-center justify-center p-0 relative group-hover:scale-110 transition-transform">
                        <img
                            src={CARD_BACK_PATH}
                            alt="Deck"
                            className="w-full h-full object-contain"
                            draggable={false}
                        />
                        {deckCount > 0 && (
                            <span className="absolute bottom-1 left-2 text-xs font-bold bg-white/80 px-1 rounded">
                                {deckCount}
                            </span>
                        )}
                    </Card>
                    <p
                        className={`text-xs text-center mt-1 font-semibold ${
                            canDraw
                                ? "text-gray-600 group-hover:text-blue-600"
                                : "text-gray-400"
                        }`}
                    >
                        {canDraw ? "Click to Draw" : "Not your turn"}
                    </p>
                </div>
                <div className="relative">
                    {activeColor && (
                        <div
                            className="absolute -inset-2 rounded-lg pointer-events-none"
                            style={{
                                boxShadow: `0 0 0 4px ${activeColor}, 0 0 16px ${activeColor}`,
                            }}
                            aria-hidden
                        />
                    )}
                    <Card className="w-16 h-24 flex items-center justify-center p-0 relative z-20">
                        <img
                            src={cardImgPath(topDiscard)}
                            alt="Top discard"
                            className="w-full h-full object-contain"
                            draggable={false}
                        />
                        {activeColor && topDiscard.color === "wild" && (
                            <span
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: activeColor }}
                                title={`Active: ${activeColor}`}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
