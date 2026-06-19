import { Crown } from "lucide-react";

interface PlayerSeatProps {
    name: string;
    isYou: boolean;
    isHost: boolean;
    isCurrentTurn?: boolean;
    cardCount?: number;
    xPercent?: number;
    yPercent?: number;
    /** Avatar diameter in px; scales the whole seat. */
    diameter?: number;
}

function PlayerSeat({
    name,
    isYou,
    isHost,
    isCurrentTurn,
    cardCount,
    xPercent,
    yPercent,
    diameter = 64,
}: PlayerSeatProps) {
    const nameFontSize = Math.max(8, Math.min(16, diameter * 0.22));
    const crownSize = Math.max(12, Math.min(24, diameter * 0.32));
    const badgeFontSize = Math.max(7, Math.min(11, diameter * 0.16));

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
        >
            <div className="relative">
                <div
                    className={`relative rounded-full shadow-md flex items-center justify-center box-border p-1
    ${
        isCurrentTurn
            ? "ring-4 ring-green-400 border-yellow-400 border-2"
            : isYou
              ? "ring-4 ring-blue-500 bg-blue-50"
              : "bg-white"
    }
  `}
                    style={{ width: `${diameter}px`, height: `${diameter}px` }}
                >
                    {isHost && (
                        <Crown
                            className="absolute -top-2 -right-2 text-yellow-500"
                            style={{
                                width: `${crownSize}px`,
                                height: `${crownSize}px`,
                            }}
                        />
                    )}
                    <span
                        className="font-semibold text-center truncate"
                        style={{
                            fontSize: `${nameFontSize}px`,
                            maxWidth: `${diameter * 0.85}px`,
                        }}
                    >
                        {name}
                    </span>
                </div>
                {isYou && (
                    <span
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-full shadow"
                        style={{ fontSize: `${badgeFontSize}px` }}
                    >
                        You
                    </span>
                )}
            </div>
            {cardCount !== undefined && (
                <span
                    className={`font-bold bg-blue-500 text-white px-1.5 rounded-full ${isYou ? "mt-3" : "mt-0.5"}`}
                    style={{ fontSize: `${badgeFontSize}px` }}
                >
                    {cardCount}
                </span>
            )}
        </div>
    );
}

export default PlayerSeat;
