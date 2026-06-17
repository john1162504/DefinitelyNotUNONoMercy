import { getDrawStackLabel } from "@/lib/cardValidation";

interface DrawStackBannerProps {
    pendingDrawCount: number;
    miniumDrawValue?: "+2" | "+4" | "reverse+4" | "+6" | "+10";
    isYourTurn: boolean;
    currentPlayerName?: string;
}

export default function DrawStackBanner({
    pendingDrawCount,
    miniumDrawValue,
    isYourTurn,
    currentPlayerName,
}: DrawStackBannerProps) {
    if (!pendingDrawCount || pendingDrawCount <= 0) return null;

    const minLabel = miniumDrawValue
        ? getDrawStackLabel(miniumDrawValue)
        : "+2";

    return (
        <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-40 max-w-lg text-center border-2 ${
                isYourTurn
                    ? "bg-orange-500 text-white border-orange-300 animate-pulse"
                    : "bg-amber-100 text-amber-900 border-amber-400"
            }`}
        >
            {isYourTurn ? (
                <>
                    <p className="font-bold">
                        Draw stack: {pendingDrawCount} cards
                    </p>
                    <p className="text-sm mt-1">
                        Play {minLabel} or higher to stack, or click the deck
                        to take all {pendingDrawCount} cards.
                    </p>
                </>
            ) : (
                <p className="font-semibold">
                    {currentPlayerName} must respond to +{pendingDrawCount}{" "}
                    (min {minLabel})
                </p>
            )}
        </div>
    );
}
