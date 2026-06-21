import type { RoomState, GameRule } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LobbyTable from "@/components/LobbyTable";
import LobbyRulesDialog from "@/components/LobbyRulesDialog";
import getSocket from "@/socket/socket";
import { useState } from "react";
import { Settings2 } from "lucide-react";

const MIN_PLAYERS = 2;

function buildCompactRulesSummary(rule: GameRule): string {
    const parts: string[] = [
        (rule.allowWinOnFunctionCard ?? true)
            ? "Win on function cards"
            : "No win on function cards",
    ];
    if (rule.rotateHandsOnZero) parts.push("0 rotates hands");
    if (rule.swapHandsOnSeven) parts.push("7 swaps hands");
    return parts.join(" · ");
}

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
    const [rulesOpen, setRulesOpen] = useState(false);

    const isHost = roomState.host === sessionId;
    const playersNeeded = Math.max(0, MIN_PLAYERS - roomState.players.length);

    const actionButtons = (
        <>
            {isHost && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-400 bg-slate-800/80 text-white hover:border-slate-300 hover:bg-slate-700 hover:text-white landscape:h-7 landscape:px-2 landscape:text-[11px]"
                    onClick={() => setRulesOpen(true)}
                >
                    <Settings2 className="h-4 w-4 landscape:h-3 landscape:w-3" />
                    Edit rules
                </Button>
            )}

            {isHost && roomState.players.length >= MIN_PLAYERS ? (
                <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 landscape:h-7 landscape:px-2 landscape:text-[11px]"
                    onClick={onStartGame}
                >
                    ▶ Start Game
                </Button>
            ) : (
                <Button
                    disabled
                    size="sm"
                    className="w-full landscape:h-7 landscape:px-2 landscape:text-[11px]"
                >
                    {playersNeeded > 0
                        ? `Waiting for ${playersNeeded} more player${playersNeeded !== 1 ? "s" : ""}...`
                        : "Waiting for host to start..."}
                </Button>
            )}

            <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-400 bg-slate-800/80 text-white hover:border-slate-300 hover:bg-slate-700 hover:text-white landscape:h-7 landscape:px-2 landscape:text-[11px]"
                onClick={handleDisconect}
            >
                Leave Room
            </Button>
        </>
    );

    return (
        <Card className="flex h-full max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-900/75 p-3 backdrop-blur-sm sm:p-4 landscape:max-h-[94dvh] landscape:p-3">
            <div className="flex min-h-0 flex-1 flex-col gap-3 landscape:flex-row landscape:items-stretch landscape:gap-3">
                <div className="flex min-h-0 shrink-0 flex-col landscape:w-[min(15rem,30vw)] landscape:justify-between landscape:overflow-hidden">
                    <CardHeader className="space-y-1 p-0 pb-2 text-center landscape:space-y-0.5 landscape:pb-1 landscape:text-left">
                        <CardTitle className="text-3xl font-bold text-white drop-shadow sm:text-4xl landscape:text-xl landscape:leading-tight">
                            UNO No Mercy
                        </CardTitle>

                        <div className="space-y-1 landscape:hidden">
                            <p className="text-lg text-white">
                                Room:{" "}
                                <span className="font-mono font-bold text-yellow-300">
                                    {roomId}
                                </span>
                            </p>
                            <p className="text-sm text-gray-100">
                                Welcome,{" "}
                                <span className="font-semibold text-white">
                                    {playerName}
                                </span>
                                !
                            </p>
                            <p className="text-xs text-gray-200">
                                {roomState.players.length} player
                                {roomState.players.length !== 1 ? "s" : ""} in
                                room
                            </p>
                            {isHost && (
                                <p className="text-xs font-semibold text-blue-300">
                                    👑 You are the host
                                </p>
                            )}
                            <p className="text-[11px] text-gray-300">
                                {(roomState.rule.allowWinOnFunctionCard ?? true)
                                    ? "Win allowed on function cards"
                                    : "Function-card finish: draw 2 (no win)"}
                            </p>
                            {(roomState.rule.rotateHandsOnZero ||
                                roomState.rule.swapHandsOnSeven) && (
                                <ul className="list-none space-y-0.5 text-[11px] text-purple-200">
                                    {roomState.rule.rotateHandsOnZero && (
                                        <li>· 0 rotates all hands</li>
                                    )}
                                    {roomState.rule.swapHandsOnSeven && (
                                        <li>· 7 swaps hands</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="hidden space-y-0.5 landscape:block">
                            <p className="text-xs leading-snug text-white">
                                Room:{" "}
                                <span className="font-mono font-bold text-yellow-300">
                                    {roomId}
                                </span>
                            </p>
                            <p className="text-[10px] leading-snug text-gray-200">
                                <span className="font-semibold text-white">
                                    {playerName}
                                </span>
                                {" · "}
                                {roomState.players.length} player
                                {roomState.players.length !== 1 ? "s" : ""}
                                {isHost && (
                                    <span className="text-blue-300">
                                        {" · Host"}
                                    </span>
                                )}
                            </p>
                            <p className="text-[10px] leading-snug text-gray-300">
                                {buildCompactRulesSummary(roomState.rule)}
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-auto hidden w-full shrink-0 flex-col items-stretch space-y-1.5 p-0 pt-1 landscape:flex">
                        {actionButtons}
                    </CardContent>
                </div>

                <div className="flex min-h-[10rem] min-w-0 flex-1 items-center justify-center landscape:min-h-0">
                    <LobbyTable
                        players={roomState.players}
                        sessionId={sessionId ?? ""}
                        hostId={roomState.host}
                    />
                </div>

                <CardContent className="flex w-full max-w-sm shrink-0 flex-col items-stretch space-y-2 p-0 landscape:hidden">
                    {actionButtons}
                </CardContent>
            </div>

            {isHost && (
                <LobbyRulesDialog
                    open={rulesOpen}
                    initialRules={roomState.rule}
                    onClose={() => setRulesOpen(false)}
                    onSave={(gameRule: GameRule) => {
                        socket.emit("update_room_rules", {
                            roomId,
                            gameRule,
                        });
                    }}
                />
            )}
        </Card>
    );
}
