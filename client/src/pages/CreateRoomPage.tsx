import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import getSocket from "../socket/socket";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function CreateRoomPage() {
    const socket = getSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const initialName =
        (location.state as { playerName?: string })?.playerName ?? "";

    const [name, setName] = useState(initialName);
    const [numOfDrawSix, setNumOfDrawSix] = useState(4);
    const [numOfDrawTen, setNumOfDrawTen] = useState(4);
    const [secondsPerRound, setSecondsPerRound] = useState(30);
    const [rotateHandsOnZero, setRotateHandsOnZero] = useState(false);
    const [swapHandsOnSeven, setSwapHandsOnSeven] = useState(false);
    const [allowWinOnFunctionCard, setAllowWinOnFunctionCard] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleRoomCreated = ({ roomId }: { roomId: string }) => {
            setIsLoading(false);
            navigate(`/room/${roomId}`, { state: { playerName: name } });
        };

        const handleError = (err: { message?: string }) => {
            setIsLoading(false);
            setError(err.message || "Failed to create room");
        };

        socket.on("room_created", handleRoomCreated);
        socket.on("error", handleError);
        socket.on("error_room_not_found", handleError);

        return () => {
            socket.off("room_created", handleRoomCreated);
            socket.off("error", handleError);
            socket.off("error_room_not_found", handleError);
        };
    }, [name, navigate]);

    const handleCreate = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Please enter your name");
            return;
        }

        if (numOfDrawSix < 0 || numOfDrawTen < 0) {
            setError("Draw counts cannot be negative");
            return;
        }

        if (secondsPerRound < 5) {
            setError("Seconds per round must be at least 5");
            return;
        }

        setError(null);
        setIsLoading(true);

        socket.emit("creating_room", {
            playerName: trimmedName,
            gameRule: {
                numOfDrawSix: numOfDrawSix,
                numOfDrawTen: numOfDrawTen,
                rotateHandsOnZero,
                swapHandsOnSeven,
                allowWinOnFunctionCard,
                secondsPerRound,
            },
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && name.trim()) {
            handleCreate();
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <h2 className="text-3xl font-bold text-center">
                    Create a Room
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Your Name:</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Number of +6 cards:</Label>
                    <Input
                        type="number"
                        min={0}
                        value={numOfDrawSix}
                        onChange={(e) =>
                            setNumOfDrawSix(Math.max(0, Number(e.target.value)))
                        }
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Number of +10 cards:</Label>
                    <Input
                        type="number"
                        min={0}
                        value={numOfDrawTen}
                        onChange={(e) =>
                            setNumOfDrawTen(Math.max(0, Number(e.target.value)))
                        }
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Seconds per round:</Label>
                    <Input
                        type="number"
                        min={5}
                        value={secondsPerRound}
                        onChange={(e) =>
                            setSecondsPerRound(
                                Math.max(5, Number(e.target.value)),
                            )
                        }
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-semibold">House rules</p>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="rotateHandsOnZero"
                            checked={rotateHandsOnZero}
                            onCheckedChange={(val) =>
                                setRotateHandsOnZero(Boolean(val))
                            }
                            disabled={isLoading}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="rotateHandsOnZero">
                                0 — Rotate all hands
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Playing 0 passes every hand to the next player
                                in turn order (follows game direction).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="swapHandsOnSeven"
                            checked={swapHandsOnSeven}
                            onCheckedChange={(val) =>
                                setSwapHandsOnSeven(Boolean(val))
                            }
                            disabled={isLoading}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="swapHandsOnSeven">
                                7 — Swap hands
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Playing 7 lets you swap hands with another
                                player (once per 7 played).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="allowWinOnFunctionCard"
                            checked={allowWinOnFunctionCard}
                            onCheckedChange={(val) =>
                                setAllowWinOnFunctionCard(Boolean(val))
                            }
                            disabled={isLoading}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="allowWinOnFunctionCard">
                                Allow winning on a function card
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                When off, finishing on a function card (or
                                enabled 0/7 rules) draws 2 instead of winning.
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full mt-4"
                    onClick={handleCreate}
                    disabled={isLoading || !name.trim()}
                >
                    {isLoading ? "Creating..." : "Create Room"}
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/")}
                    disabled={isLoading}
                >
                    Back to Home
                </Button>
            </div>
        </main>
    );
}

export default CreateRoomPage;
