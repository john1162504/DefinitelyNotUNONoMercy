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
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-black/70 text-white shadow-lg border border-white/20">
            <span className="hidden sm:inline text-sm font-semibold uppercase tracking-wide">
                Active color
            </span>
            <span
                className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-inner"
                style={{ backgroundColor: activeColor }}
                aria-label={COLOR_LABELS[activeColor]}
            />
            <span className="text-xs sm:text-sm font-bold">
                {COLOR_LABELS[activeColor]}
            </span>
        </div>
    );
}
