import { SERVER_URL } from "@/config/serverUrl";

const MAX_ATTEMPTS = 40;
const INTERVAL_MS = 2500;
const REQUEST_TIMEOUT_MS = 8000;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForServer(
    onAttempt?: (attempt: number) => void,
): Promise<boolean> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        onAttempt?.(attempt);

        try {
            const res = await fetch(`${SERVER_URL}/health`, {
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });

            if (res.ok) return true;
        } catch {
            // Expected to fail if server isn't live, so we can ignore them and no need to log anything
        }

        if (attempt < MAX_ATTEMPTS) await sleep(INTERVAL_MS);
    }
    return false;
}
