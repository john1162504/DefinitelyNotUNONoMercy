type TimerCallback = (roomId: string) => void;

const timers: Record<string, NodeJS.Timeout> = {};
const expiresAt: Record<string, number> = {};

export function clearTurnTimer(roomId: string) {
    if (timers[roomId]) {
        clearTimeout(timers[roomId]);
        delete timers[roomId];
    }
    delete expiresAt[roomId];
}

export function getTurnExpiresAt(roomId: string): number | undefined {
    return expiresAt[roomId];
}

export function startTurnTimer(
    roomId: string,
    seconds: number,
    onExpire: TimerCallback,
) {
    clearTurnTimer(roomId);
    if (seconds <= 0) return;

    expiresAt[roomId] = Date.now() + seconds * 1000;
    timers[roomId] = setTimeout(() => {
        delete expiresAt[roomId];
        delete timers[roomId];
        onExpire(roomId);
    }, seconds * 1000);
}
