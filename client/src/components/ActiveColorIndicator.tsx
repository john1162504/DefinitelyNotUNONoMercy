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
            className="flex w-fit items-center gap-1 rounded-full border border-white/20 bg-black/70 px-1.5 py-0.5 text-white shadow-md sm:gap-1.5 sm:px-2 sm:py-1"
            title={`Active color: ${COLOR_LABELS[activeColor]}`}
        >
            <span
                className="h-3 w-3 rounded-full border border-white shadow-inner sm:h-3.5 sm:w-3.5 sm:border-2"
                style={{ backgroundColor: activeColor }}
                aria-label={COLOR_LABELS[activeColor]}
            />
            <span className="text-[10px] font-bold sm:text-xs">
                {COLOR_LABELS[activeColor]}
            </span>
        </div>
    );
}
