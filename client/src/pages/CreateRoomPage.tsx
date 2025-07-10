import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function CreateRoomPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [numOfDrawSix, setNumOfDrawSix] = useState(4);
    const [numOfDrawTen, setNumOfDrawTen] = useState(4);
    const [secondsPerRound, setSecondsPerRound] = useState(30);
    const [specialRulesEnabled, setSpecialRulesEnabled] = useState(false);

    useEffect(() => {
        socket.on("room_created", ({ roomId }: { roomId: string }) => {
            navigate(`/room/${roomId}`, { state: { playerName: name } });
        });

        return () => {
            socket.off("room_created");
        };
    }, [name, navigate]);

    const handleCreate = () => {
        if (!name.trim()) return;

        socket.emit("creating_room", {
            playerName: name,
            gameRule: {
                numOfDraWSix: numOfDrawSix,
                numOfDrawTen: numOfDrawTen,
                specialRulesIsEnabled: specialRulesEnabled,
                secondsPerRound: secondsPerRound,
            },
        });
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <h2 className="text-3xl font-bold text-center">
                    Create a Room
                </h2>

                <div className="space-y-2">
                    <Label>Your Name:</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Number of +6 cards:</Label>
                    <Input
                        type="number"
                        min={0}
                        value={numOfDrawSix}
                        onChange={(e) =>
                            setNumOfDrawSix(Number(e.target.value))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label>Number of +10 cards:</Label>
                    <Input
                        type="number"
                        min={0}
                        value={numOfDrawTen}
                        onChange={(e) =>
                            setNumOfDrawTen(Number(e.target.value))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label>Seconds per round:</Label>
                    <Input
                        type="number"
                        min={5}
                        value={secondsPerRound}
                        onChange={(e) =>
                            setSecondsPerRound(Number(e.target.value))
                        }
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="specialRules"
                        checked={specialRulesEnabled}
                        onCheckedChange={(val) =>
                            setSpecialRulesEnabled(Boolean(val))
                        }
                    />
                    <Label htmlFor="specialRules">Enable Special Rules</Label>
                </div>

                <Button className="w-full mt-4" onClick={handleCreate}>
                    Create Room
                </Button>
            </div>
        </main>
    );
}

export default CreateRoomPage;
