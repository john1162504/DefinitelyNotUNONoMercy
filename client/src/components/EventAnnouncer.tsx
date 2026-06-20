import { useEffect, useState } from "react";
import type { GameEvent } from "@/types";
import type { TimedGameEvent } from "@/pages/RoomPage";

const TOAST_MS = 2800;

function formatEvent(event: GameEvent): string | null {
    const actor = event.actorName ?? "A player";
    switch (event.type) {
        case "swapHands":
            return `🔀 ${actor} swapped hands with ${event.targetName ?? "another player"}`;
        case "rotateHands":
            return event.count && event.count > 1
                ? `🔄 ${actor} rotated all hands x${event.count}!`
                : `🔄 ${actor} rotated all hands!`;
        case "skip":
            return event.count && event.count > 1
                ? `⏭️ ${actor} skipped ${event.count} players`
                : `⏭️ ${actor} skipped the next player`;
        case "reverse":
            return `🔁 ${actor} reversed the direction`;
        case "drawStack":
            return `➕ ${actor} played ${event.value} — stack is now +${event.count}`;
        case "discardAll":
            return event.color
                ? `🗑️ ${actor} discarded all ${event.color} cards (+${event.count})`
                : `🗑️ ${actor} discarded all matching color cards (+${event.count})`;
        case "colorRoulette":
            return null; // handled by RouletteOverlay
        default:
            return null;
    }
}

interface EventAnnouncerProps {
    event: TimedGameEvent | null;
}

export default function EventAnnouncer({ event }: EventAnnouncerProps) {
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

    useEffect(() => {
        if (!event) return;
        const message = formatEvent(event);
        if (!message) return;

        const id = event.eventId;
        setToasts((prev) =>
            prev.some((t) => t.id === id) ? prev : [...prev, { id, message }],
        );

        const timer = setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_MS);
        return () => clearTimeout(timer);
    }, [event?.eventId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed left-1/2 top-28 sm:top-36 z-[120] flex w-full max-w-[92vw] -translate-x-1/2 flex-col items-center gap-1.5 sm:gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="animate-in fade-in slide-in-from-top-2 max-w-full truncate rounded-xl border border-purple-300 sm:border-2 bg-purple-600/95 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-lg"
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
