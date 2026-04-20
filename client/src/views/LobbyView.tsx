import type { RoomState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LobbyTable from "@/components/LobbyTable";
import socket from "@/socket/socket";

interface LobbyViewProps {
    roomState: RoomState;
    roomId: string;
    playerName: string;
    onStartGame?: () => void;
    handleDisconect?: () => void;
}

export default function LobbyView({
    roomState,
    roomId,
    playerName,
    onStartGame,
    handleDisconect,
}: LobbyViewProps) {
    const sessionId = (socket.auth as { sessionId?: string })?.sessionId;

    const isHost = roomState.host === sessionId;
    const playersNeeded = Math.max(0, 2 - roomState.players.length);

    return (
        <Card className="w-full max-w-2xl p-6">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-4xl font-bold mb-2">
                    UNO No Mercy
                </CardTitle>
                <p className="text-xl text-gray-700">
                    Room: <span className="font-mono font-bold">{roomId}</span>
                </p>
                <p className="text-muted-foreground">
                    Welcome, <span className="font-semibold">{playerName}</span>
                    !
                </p>
                {isHost && (
                    <p className="text-sm text-blue-600 mt-2">
                        👑 You are the host
                    </p>
                )}
            </CardHeader>

            {/* Player Table UI */}
            <LobbyTable
                players={roomState.players}
                currentPlayerName={playerName}
                hostId={roomState.host}
            />

            <CardContent className="w-full flex flex-col items-center max-w-sm mx-auto space-y-3 mt-6">
                {isHost && roomState.players.length >= 2 ? (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={onStartGame}
                    >
                        ▶ Start Game
                    </Button>
                ) : (
                    <Button disabled className="w-full">
                        {playersNeeded > 0
                            ? `Waiting for ${playersNeeded} more player${playersNeeded !== 1 ? "s" : ""}...`
                            : "Waiting for host to start..."}
                    </Button>
                )}

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDisconect}
                >
                    Leave Room
                </Button>
            </CardContent>
        </Card>
    );
}
