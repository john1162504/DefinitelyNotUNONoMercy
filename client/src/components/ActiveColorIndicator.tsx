import type { PlayableColor } from "@/lib/cardValidation";

const COLOR_LABELS: Record<PlayableColor, string> = {
    red: "Red",
    green: "Green",
    blue: "Blue",
    yellow: "Yellow",
};

interface ActiveColorIndicatorProps {
    activeColor: PlayableColor;
}

export default function ActiveColorIndicator({
    activeColor,
}: ActiveColorIndicatorProps) {
    return (
        <div
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-black/70 text-white shadow-lg border border-white/20"
            title={`Active color: ${COLOR_LABELS[activeColor]}`}
        >
            <span
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-inner"
                style={{ backgroundColor: activeColor }}
                aria-label={COLOR_LABELS[activeColor]}
            />
            <span className="text-xs sm:text-sm font-bold">
                {COLOR_LABELS[activeColor]}
            </span>
        </div>
    );
}
