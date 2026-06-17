import { Button } from "@/components/ui/button";

interface UnoChallengeButtonProps {
    xPercent: number;
    yPercent: number;
    targetName: string;
    isTarget: boolean;
    onPress: () => void;
}

export default function UnoChallengeButton({
    xPercent,
    yPercent,
    targetName,
    isTarget,
    onPress,
}: UnoChallengeButtonProps) {
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
                className="bg-red-600 hover:bg-red-700 hover:scale-110 text-white font-extrabold text-xl px-10 py-6 shadow-2xl border-4 border-yellow-300 animate-bounce transition-transform"
                onClick={onPress}
            >
                UNO!
            </Button>
            <p className="text-center text-xs font-semibold mt-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-[10rem]">
                {isTarget
                    ? "Tap before anyone else!"
                    : `${targetName} has 1 card — catch them!`}
            </p>
        </div>
    );
}
