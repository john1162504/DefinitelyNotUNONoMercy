import { Card } from "./ui/card";
import type { Card as UNO } from "@/types";
import { RotateCcw, RotateCw } from "lucide-react";

const CARD_BACK_PATH = "/assets/Cards/individual/card back/card_back.png";
const cardImgPath = (card: UNO) =>
    `/assets/Cards/individual/${card.color}/${card.value}_${card.color}.png`;

interface CenterPileProps {
    deckCount: number;
    topDiscard: UNO;
    direction: 1 | -1;
    onTakeDraw?: (count: number) => void;
}

export default function CenterPile({
    deckCount,
    topDiscard,
    direction,
    onTakeDraw,
}: CenterPileProps) {
    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            {/* Direction arrow above */}
            <div className="mb-2">
                {direction === 1 ? (
                    <RotateCw className="w-10 h-10 text-yellow-400 animate-spin-slow" />
                ) : (
                    <RotateCcw className="w-10 h-10 text-yellow-400 animate-spin-slow-reverse" />
                )}
            </div>
            <div className="flex gap-6 items-center">
                <Card className="w-16 h-24 flex items-center justify-center p-0 relative">
                    <img
                        src={CARD_BACK_PATH}
                        alt="Deck"
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => onTakeDraw?.(1)}
                        draggable={false}
                    />
                    {deckCount > 0 && (
                        <span className="absolute bottom-1 left-2 text-xs font-bold bg-white/80 px-1 rounded">
                            {deckCount}
                        </span>
                    )}
                </Card>
                <Card className="w-16 h-24 flex items-center justify-center p-0 relative z-20">
                    <img
                        src={cardImgPath(topDiscard)}
                        alt="Top discard"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </Card>
            </div>
        </div>
    );
}
