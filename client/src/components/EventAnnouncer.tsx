import { useEffect, useRef, useState } from "react";
import type { GameEvent } from "@/types";
import type { TimedGameEvent } from "@/pages/RoomPage";

const TOAST_MS = 2800;
const MAX_VISIBLE_TOASTS = 3;

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
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>(
        [],
    );
    const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!event) return;
        const message = formatEvent(event);
        if (!message) return;

        const id = event.eventId;
        setToasts((prev) => {
            if (prev.some((t) => t.id === id)) return prev;
            const next = [...prev, { id, message }];
            return next.slice(-MAX_VISIBLE_TOASTS);
        });

        const timer = setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
            timersRef.current.delete(timer);
        }, TOAST_MS);
        timersRef.current.add(timer);
    }, [event?.eventId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (toasts.length === 0) return null;

    return (
        <div className="flex w-full flex-col gap-1">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="animate-in fade-in slide-in-from-left-1 max-w-full truncate rounded-md border border-purple-300/80 bg-purple-600/95 px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs"
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
