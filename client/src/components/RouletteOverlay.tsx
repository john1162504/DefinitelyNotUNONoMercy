import { useEffect, useState } from "react";
import type { Card as UNO } from "@/types";
import type { TimedGameEvent } from "@/pages/RoomPage";

const cardImgPath = (card: UNO) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${card.color}/${
        card.value
    }_${card.color}.png`;

const REVEAL_MS = 500;

interface RouletteOverlayProps {
    event: TimedGameEvent | null;
}

export default function RouletteOverlay({ event }: RouletteOverlayProps) {
    const [active, setActive] = useState<TimedGameEvent | null>(null);
    const [revealed, setRevealed] = useState(0);

    const eventId =
        event && event.type === "colorRoulette" ? event.eventId : null;

    useEffect(() => {
        if (!event || event.type !== "colorRoulette") return;
        setActive(event);
        setRevealed(0);
    }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!active) return;
        const cards = active.drawnCards ?? [];

        if (revealed < cards.length) {
            const t = setTimeout(() => setRevealed((r) => r + 1), REVEAL_MS);
            return () => clearTimeout(t);
        }

        const t = setTimeout(() => setActive(null), 2000);
        return () => clearTimeout(t);
    }, [active, revealed]);

    if (!active) return null;

    const cards = active.drawnCards ?? [];
    const color = active.color;
    const finished = revealed >= cards.length;

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-black/75 px-4"
            onClick={() => setActive(null)}
        >
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white drop-shadow">
                    🎯 Color Roulette
                </h2>
                <p className="mt-2 text-lg text-gray-200">
                    <span className="font-bold text-white">
                        {active.targetName ?? "Next player"}
                    </span>{" "}
                    draws until{" "}
                    {color ? (
                        <span
                            className="inline-flex items-center gap-1 font-bold"
                            style={{ color }}
                        >
                            <span
                                className="inline-block h-4 w-4 rounded-full border border-white"
                                style={{ backgroundColor: color }}
                            />
                            {color}
                        </span>
                    ) : (
                        "the chosen color"
                    )}
                </p>
            </div>

            <div className="flex max-w-[90vw] flex-wrap items-center justify-center gap-2">
                {cards.map((card, i) => {
                    const isShown = i < revealed;
                    const isMatch = card.color === color;
                    const isFinal = i === cards.length - 1 && isMatch;
                    return (
                        <img
                            key={`${card.color}-${card.value}-${i}`}
                            src={cardImgPath(card)}
                            alt={`${card.color} ${card.value}`}
                            draggable={false}
                            className="h-28 w-auto rounded-md bg-white shadow-lg transition-all duration-300"
                            style={{
                                opacity: isShown ? 1 : 0,
                                transform: isShown
                                    ? "translateY(0) scale(1)"
                                    : "translateY(20px) scale(0.8)",
                                boxShadow:
                                    isShown && isFinal
                                        ? `0 0 0 4px ${color}, 0 0 24px ${color}`
                                        : "0 4px 12px rgba(0,0,0,0.4)",
                            }}
                        />
                    );
                })}
            </div>

            <p className="text-sm text-gray-300">
                {finished
                    ? `Drew ${cards.length} card${cards.length === 1 ? "" : "s"}. Tap to dismiss.`
                    : "Revealing…"}
            </p>
        </div>
    );
}
