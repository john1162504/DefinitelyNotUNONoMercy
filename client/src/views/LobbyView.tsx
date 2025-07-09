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
    const isHost = roomState.host === socket.id;

    return (
        <Card className="w-full max-w-5xl p-6 relative aspect-square">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">
                    Room: {roomId}
                </CardTitle>
                <p className="text-muted-foreground">Welcome, {playerName}!</p>
            </CardHeader>

            {/* Player Table UI */}
            <LobbyTable
                players={roomState.players}
                currentPlayerName={playerName}
                hostId={roomState.host}
            />

            <CardContent className="w-full flex flex-col items-center max-w-sm mx-auto space-y-3 mt-6">
                {isHost && roomState.players.length >= 2 ? (
                    <Button className="w-full" onClick={onStartGame}>
                        Start Game
                    </Button>
                ) : (
                    <Button disabled className="w-full">
                        Waiting for more players...
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
