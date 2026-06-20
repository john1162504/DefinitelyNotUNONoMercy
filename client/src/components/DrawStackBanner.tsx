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
            className={`fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-40 max-w-[72vw] sm:max-w-md text-center border sm:border-2 ${
                isYourTurn
                    ? "bg-orange-500 text-white border-orange-300 animate-pulse"
                    : "bg-amber-100 text-amber-900 border-amber-400"
            }`}
        >
            {isYourTurn ? (
                <>
                    <p className="font-bold text-xs sm:text-base">
                        Draw stack: {pendingDrawCount} cards
                    </p>
                    <p className="text-[11px] sm:text-sm mt-0.5 sm:mt-1">
                        Play {minLabel} or higher to stack, or click the deck
                        to take all {pendingDrawCount} cards.
                    </p>
                </>
            ) : (
                <p className="font-semibold text-xs sm:text-base">
                    {currentPlayerName} must respond to +{pendingDrawCount}{" "}
                    (min {minLabel})
                </p>
            )}
        </div>
    );
}
