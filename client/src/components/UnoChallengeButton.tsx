import { Button } from "@/components/ui/button";

interface UnoChallengeButtonProps {
    xPercent: number;
    yPercent: number;
    targetName: string;
    isTarget: boolean;
    tableWidth?: number;
    onPress: () => void;
}

export default function UnoChallengeButton({
    xPercent,
    yPercent,
    targetName,
    isTarget,
    tableWidth = 800,
    onPress,
}: UnoChallengeButtonProps) {
    const btnHeight = Math.max(40, Math.min(56, tableWidth * 0.07));
    const btnFontSize = Math.max(14, Math.min(22, tableWidth * 0.0275));
    const btnPadX = Math.max(16, Math.min(40, tableWidth * 0.05));
    const borderW = Math.max(2, Math.min(4, Math.round(tableWidth * 0.005)));
    const hintFontSize = Math.max(9, Math.min(12, tableWidth * 0.014));
    const hintMaxWidth = Math.max(120, Math.min(160, tableWidth * 0.2));

    return (
        <div
            className="fixed z-[60] pointer-events-auto"
            style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <Button
                className="bg-red-600 hover:bg-red-700 hover:scale-110 text-white font-extrabold shadow-2xl border-yellow-300 animate-bounce transition-transform"
                style={{
                    minHeight: `${btnHeight}px`,
                    fontSize: `${btnFontSize}px`,
                    paddingLeft: `${btnPadX}px`,
                    paddingRight: `${btnPadX}px`,
                    borderWidth: `${borderW}px`,
                }}
                onClick={onPress}
            >
                UNO!
            </Button>
            <p
                className="text-center font-semibold mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                style={{
                    fontSize: `${hintFontSize}px`,
                    maxWidth: `${hintMaxWidth}px`,
                }}
            >
                {isTarget
                    ? "Tap before anyone else!"
                    : `${targetName} has 1 card — catch them!`}
            </p>
        </div>
    );
}
