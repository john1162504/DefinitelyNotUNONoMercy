import { useEffect, useState } from "react";
import type { GameRule } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

const DARK_DIALOG_CHECKBOX_CLASS =
    "mt-0.5 border-slate-400 bg-slate-800 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white focus-visible:ring-slate-400";

interface LobbyRulesDialogProps {
    open: boolean;
    initialRules: GameRule;
    onClose: () => void;
    onSave: (rules: GameRule) => void;
}

export default function LobbyRulesDialog({
    open,
    initialRules,
    onClose,
    onSave,
}: LobbyRulesDialogProps) {
    const [numOfDrawSix, setNumOfDrawSix] = useState(initialRules.numOfDrawSix);
    const [numOfDrawTen, setNumOfDrawTen] = useState(initialRules.numOfDrawTen);
    const [secondsPerRound, setSecondsPerRound] = useState(
        initialRules.secondsPerRound,
    );
    const [rotateHandsOnZero, setRotateHandsOnZero] = useState(
        initialRules.rotateHandsOnZero,
    );
    const [swapHandsOnSeven, setSwapHandsOnSeven] = useState(
        initialRules.swapHandsOnSeven,
    );
    const [allowWinOnFunctionCard, setAllowWinOnFunctionCard] = useState(
        initialRules.allowWinOnFunctionCard ?? true,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setNumOfDrawSix(initialRules.numOfDrawSix);
        setNumOfDrawTen(initialRules.numOfDrawTen);
        setSecondsPerRound(initialRules.secondsPerRound);
        setRotateHandsOnZero(initialRules.rotateHandsOnZero);
        setSwapHandsOnSeven(initialRules.swapHandsOnSeven);
        setAllowWinOnFunctionCard(initialRules.allowWinOnFunctionCard ?? true);
        setError(null);
    }, [open, initialRules]);

    if (!open) return null;

    const handleSave = () => {
        if (numOfDrawSix < 0 || numOfDrawTen < 0) {
            setError("Draw counts cannot be negative");
            return;
        }
        if (secondsPerRound < 5) {
            setError("Seconds per round must be at least 5");
            return;
        }

        onSave({
            numOfDrawSix,
            numOfDrawTen,
            secondsPerRound,
            rotateHandsOnZero,
            swapHandsOnSeven,
            allowWinOnFunctionCard,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-600 bg-slate-900 p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lobby-rules-title"
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3
                            id="lobby-rules-title"
                            className="text-lg font-bold text-white"
                        >
                            Edit room rules
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                            Changes apply before the game starts.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 shrink-0 text-gray-400 hover:text-white"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {error && (
                    <div className="mb-3 rounded border border-red-400/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-200">
                            Number of +6 cards
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={numOfDrawSix}
                            onChange={(e) =>
                                setNumOfDrawSix(
                                    Math.max(0, Number(e.target.value)),
                                )
                            }
                            className="border-slate-600 bg-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-200">
                            Number of +10 cards
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={numOfDrawTen}
                            onChange={(e) =>
                                setNumOfDrawTen(
                                    Math.max(0, Number(e.target.value)),
                                )
                            }
                            className="border-slate-600 bg-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-200">
                            Seconds per round
                        </Label>
                        <Input
                            type="number"
                            min={5}
                            value={secondsPerRound}
                            onChange={(e) =>
                                setSecondsPerRound(
                                    Math.max(5, Number(e.target.value)),
                                )
                            }
                            className="border-slate-600 bg-slate-800 text-white"
                        />
                    </div>

                    <div className="space-y-3 rounded-lg border border-slate-700 p-3">
                        <p className="text-sm font-semibold text-white">
                            House rules
                        </p>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="lobby-rotateHandsOnZero"
                                checked={rotateHandsOnZero}
                                onCheckedChange={(val) =>
                                    setRotateHandsOnZero(Boolean(val))
                                }
                                className={DARK_DIALOG_CHECKBOX_CLASS}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="lobby-rotateHandsOnZero"
                                    className="text-gray-200"
                                >
                                    0 — Rotate all hands
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Playing 0 passes every hand to the next
                                    player in turn order.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="lobby-swapHandsOnSeven"
                                checked={swapHandsOnSeven}
                                onCheckedChange={(val) =>
                                    setSwapHandsOnSeven(Boolean(val))
                                }
                                className={DARK_DIALOG_CHECKBOX_CLASS}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="lobby-swapHandsOnSeven"
                                    className="text-gray-200"
                                >
                                    7 — Swap hands
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Playing 7 lets you swap hands with another
                                    player.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="lobby-allowWinOnFunctionCard"
                                checked={allowWinOnFunctionCard}
                                onCheckedChange={(val) =>
                                    setAllowWinOnFunctionCard(Boolean(val))
                                }
                                className={DARK_DIALOG_CHECKBOX_CLASS}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="lobby-allowWinOnFunctionCard"
                                    className="text-gray-200"
                                >
                                    Allow winning on a function card
                                </Label>
                                <p className="text-xs text-gray-400">
                                    When off, finishing on a function card draws
                                    2 instead of winning.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-slate-400 bg-slate-800/80 text-white hover:border-slate-300 hover:bg-slate-700 hover:text-white"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleSave}
                    >
                        Save rules
                    </Button>
                </div>
            </div>
        </div>
    );
}
