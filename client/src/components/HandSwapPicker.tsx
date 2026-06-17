import { Button } from "@/components/ui/button";
import type { Player } from "@/types";

interface HandSwapPickerProps {
    players: Player[];
    actorId: string;
    swapsRemaining: number;
    onSwap: (targetPlayerId: string) => void;
}

export default function HandSwapPicker({
    players,
    actorId,
    swapsRemaining,
    onSwap,
}: HandSwapPickerProps) {
    const targets = players.filter((p) => p.id !== actorId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-purple-400">
                <h3 className="text-xl font-bold text-center mb-1">
                    Swap hands (7)
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                    Choose a player to swap with
                    {swapsRemaining > 1
                        ? ` — ${swapsRemaining} swaps remaining`
                        : ""}
                </p>
                <div className="flex flex-col gap-2">
                    {targets.map((player) => (
                        <Button
                            key={player.id}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => onSwap(player.id)}
                        >
                            Swap with {player.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
