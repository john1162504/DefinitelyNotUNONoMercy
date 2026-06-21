import type { Player } from "@/types";
import PlayerSeat from "./PlayerSeat";
import { useEffect, useRef, useState } from "react";

interface LobbyTableProps {
    players: Player[];
    sessionId: string;
    hostId: string;
}

export default function LobbyTable({
    players,
    sessionId,
    hostId,
}: LobbyTableProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 400, height: 225 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => {
            setSize({
                width: el.clientWidth,
                height: el.clientHeight,
            });
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener("resize", update);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    const userIdx = players.findIndex((p) => p.id === sessionId);
    const orderedPlayers =
        userIdx >= 0
            ? [...players.slice(userIdx), ...players.slice(0, userIdx)]
            : players;

    const aspect = 16 / 9;
    let tableWidth = Math.max(160, size.width);
    let tableHeight = tableWidth / aspect;
    if (tableHeight > size.height) {
        tableHeight = Math.max(120, size.height);
        tableWidth = tableHeight * aspect;
    }

    const seatDiameter = Math.max(
        32,
        Math.min(72, Math.min(tableWidth, tableHeight) * 0.14),
    );

    return (
        <div
            ref={containerRef}
            className="relative mx-auto h-full w-full min-h-[9rem] max-h-full max-w-full landscape:min-h-0"
        >
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: `${tableWidth}px`,
                    height: `${tableHeight}px`,
                }}
            >
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        backgroundImage: `url('${
                            import.meta.env.BASE_URL
                        }assets/Tables/table_green.png')`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />

                {orderedPlayers.map((player, idx) => {
                    const baseAngle = 90;
                    const angle = baseAngle + (360 / players.length) * idx;
                    const rad = (angle * Math.PI) / 180;
                    const xRadius = 46;
                    const yRadius = 42;
                    const xPercent = 50 + Math.cos(rad) * xRadius;
                    const yPercent = 50 + Math.sin(rad) * yRadius;

                    return (
                        <PlayerSeat
                            key={player.id}
                            name={player.name}
                            isYou={player.id === sessionId}
                            isHost={player.id === hostId}
                            xPercent={xPercent}
                            yPercent={yPercent}
                            diameter={seatDiameter}
                        />
                    );
                })}
            </div>
        </div>
    );
}
