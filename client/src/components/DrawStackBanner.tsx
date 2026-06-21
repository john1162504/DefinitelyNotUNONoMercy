import { getDrawStackLabel } from "@/lib/cardValidation";

interface DrawStackBannerProps {
    pendingDrawCount: number;
    minimumDrawValue?: "+2" | "+4" | "reverse+4" | "+6" | "+10";
    isYourTurn: boolean;
    currentPlayerName?: string;
}

export default function DrawStackBanner({
    pendingDrawCount,
    minimumDrawValue,
    isYourTurn,
    currentPlayerName,
}: DrawStackBannerProps) {
    if (!pendingDrawCount || pendingDrawCount <= 0) return null;

    const minLabel = minimumDrawValue
        ? getDrawStackLabel(minimumDrawValue)
        : "+2";

    return (
        <div
            className={`w-full rounded-md border px-2 py-1 text-[10px] shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs ${
                isYourTurn
                    ? "animate-pulse border-orange-300/80 bg-orange-500 text-white"
                    : "border-amber-400/80 bg-amber-100 text-amber-900"
            }`}
        >
            {isYourTurn ? (
                <>
                    <p className="truncate font-bold">
                        Draw stack: +{pendingDrawCount} (min {minLabel})
                    </p>
                    <p className="mt-0.5 hidden truncate opacity-90 sm:block">
                        Stack with {minLabel}+ or take all from deck
                    </p>
                </>
            ) : (
                <p className="truncate font-semibold">
                    {currentPlayerName} must respond to +{pendingDrawCount}{" "}
                    (min {minLabel})
                </p>
            )}
        </div>
    );
}
