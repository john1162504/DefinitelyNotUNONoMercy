import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function App() {
    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        if (roomId.trim()) {
            navigate(`/room/${roomId}`, { state: { playerName: playerName } });

            console.log("Joining room", roomId);
        }
    };

    const handleCreate = () => {
        navigate("/create");
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <h1 className="text-4xl font-bold">UNO No Mercy</h1>
                <div className="text-left space-y-2">
                    <div className="flex gap-2">
                        <Input
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Name:"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            id="roomId"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Room ID:"
                        />
                        <Button onClick={handleJoin}>Join</Button>
                    </div>
                </div>

                <Button variant="outline" onClick={handleCreate}>
                    Create Room
                </Button>
            </div>
        </main>
    );
}

export default App;
