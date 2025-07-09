import { Crown } from "lucide-react";

interface PlayerSeatProps {
    name: string;
    isYou: boolean;
    isHost: boolean;
    isCurrentTurn?: boolean;
    xPercent?: number;
    yPercent?: number;
}

function PlayerSeat({
    name,
    isYou,
    isHost,
    isCurrentTurn,
    xPercent,
    yPercent,
}: PlayerSeatProps) {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
        >
            <div
                className={`relative p-2 rounded-full shadow-md w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center
    ${
        isCurrentTurn
            ? "ring-4 ring-green-400 border-yellow-400 border-2"
            : "bg-white"
    }
  `}
            >
                {" "}
                {isHost && (
                    <Crown className="absolute -top-2 -right-2 text-yellow-500 w-5 h-5" />
                )}
                <span className="text-xs md:text-sm lg:text-base font-semibold text-center truncate max-w-[4rem]">
                    {name}
                </span>
            </div>
            {isYou && <span className="text-xs text-blue-500 mt-1">(You)</span>}
        </div>
    );
}

export default PlayerSeat;
