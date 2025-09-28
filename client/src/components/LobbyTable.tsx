import type { Player } from "@/types";
import PlayerSeat from "./PlayerSeat";

interface PlayerTableProps {
    players: Player[];
    currentPlayerName: string;
    hostId: string;
}

export default function LobbyTable({
    players,
    currentPlayerName,
    hostId,
}: PlayerTableProps) {
    const userIdx = players.findIndex((p) => p.name === currentPlayerName);
    const orderedPlayers = [
        ...players.slice(userIdx),
        ...players.slice(0, userIdx),
    ];
    return (
        <div className="relative w-full aspect-[16/9] mx-auto">
            {/* Table background */}
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

            {/* Player positions */}
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
                        isYou={player.name === currentPlayerName}
                        isHost={player.id === hostId}
                        xPercent={xPercent}
                        yPercent={yPercent}
                    />
                );
            })}
        </div>
    );
}
