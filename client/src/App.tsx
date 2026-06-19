import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function App() {
    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        const trimmedName = playerName.trim();
        const trimmedRoomId = roomId.trim();

        if (!trimmedName) {
            alert("Please enter your name");
            return;
        }

        if (!trimmedRoomId) {
            alert("Please enter a room ID");
            return;
        }

        // Validate room ID is numeric
        if (!/^\d{4}$/.test(trimmedRoomId)) {
            alert("Room ID must be 4 digits");
            return;
        }

        navigate(`/room/${trimmedRoomId}`, {
            state: { playerName: trimmedName },
        });
    };

    const handleCreate = () => {
        navigate("/create", {
            state: { playerName: playerName.trim() },
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && playerName.trim() && roomId.trim()) {
            handleJoin();
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <h1 className="text-4xl font-bold">UNO No Mercy</h1>
                <div className="text-left space-y-2">
                    <div>
                        <Input
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    if (roomId.trim()) handleJoin();
                                    else handleCreate();
                                }
                            }}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            id="roomId"
                            value={roomId}
                            onChange={(e) =>
                                setRoomId(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4),
                                )
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="Room ID (4 digits)"
                            maxLength={4}
                        />
                        <Button
                            onClick={handleJoin}
                            disabled={!playerName.trim() || !roomId.trim()}
                        >
                            Join
                        </Button>
                    </div>
                </div>

                <Button variant="outline" onClick={handleCreate}>
                    Create Room
                </Button>

                <div>
                    <Link
                        to="/rules"
                        className="text-sm font-medium text-white underline-offset-4 hover:underline"
                    >
                        How to play
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default App;
