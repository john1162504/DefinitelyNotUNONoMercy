import type { RoomState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LobbyTable from "@/components/LobbyTable";
import getSocket from "@/socket/socket";

const MIN_PLAYERS = 2;

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
    const socket = getSocket();
    const sessionId = (socket.auth as { sessionId?: string })?.sessionId;

    const isHost = roomState.host === sessionId;
    const playersNeeded = Math.max(0, MIN_PLAYERS - roomState.players.length);

    return (
        <Card className="w-full max-w-2xl rounded-2xl bg-slate-900/75 p-6 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
                <CardTitle className="mb-2 text-4xl font-bold text-white drop-shadow">
                    UNO No Mercy
                </CardTitle>
                <p className="text-xl text-white">
                    Room:{" "}
                    <span className="font-mono font-bold text-yellow-300">
                        {roomId}
                    </span>
                </p>
                <p className="text-gray-100">
                    Welcome,{" "}
                    <span className="font-semibold text-white">
                        {playerName}
                    </span>
                    !
                </p>
                <p className="mt-1 text-sm text-gray-200">
                    {roomState.players.length} player
                    {roomState.players.length !== 1 ? "s" : ""} in room
                </p>
                {isHost && (
                    <p className="mt-2 text-sm font-semibold text-blue-300">
                        👑 You are the host
                    </p>
                )}
                <p className="mt-2 text-xs text-gray-300">
                    {(roomState.rule.allowWinOnFunctionCard ?? true)
                        ? "Win allowed on function cards"
                        : "Function-card finish: draw 2 (no win)"}
                </p>
                {(roomState.rule.rotateHandsOnZero ||
                    roomState.rule.swapHandsOnSeven) && (
                    <ul className="mt-1 list-none space-y-0.5 text-xs text-purple-200">
                        {roomState.rule.rotateHandsOnZero && (
                            <li>· 0 rotates all hands</li>
                        )}
                        {roomState.rule.swapHandsOnSeven && (
                            <li>· 7 swaps hands</li>
                        )}
                    </ul>
                )}
            </CardHeader>

            <LobbyTable
                players={roomState.players}
                sessionId={sessionId ?? ""}
                hostId={roomState.host}
            />

            <CardContent className="w-full flex flex-col items-center max-w-sm mx-auto space-y-3 mt-6">
                {isHost && roomState.players.length >= MIN_PLAYERS ? (
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
