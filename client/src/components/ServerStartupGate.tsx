import { useCallback, useEffect, useState } from "react";
import { waitForServer } from "@/lib/waitForServer";
import { initSocket } from "@/socket/socket";
import { Button } from "@/components/ui/button";

type GateStatus = "checking" | "ready" | "failed";

export function ServerStartupGate({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<GateStatus>("checking");
    const [attempt, setAttempt] = useState(1);
    const [checkKey, setCheckKey] = useState(0);

    const runCheck = useCallback(async () => {
        setStatus("checking");
        setAttempt(1);

        const isLive = await waitForServer(setAttempt);
        if (isLive) {
            initSocket();
            setStatus("ready");
        } else {
            setStatus("failed");
        }
    }, []);

    useEffect(() => {
        runCheck();
    }, [runCheck, checkKey]);

    if (status === "ready") return <>{children}</>;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
            {status === "checking" ? (
                <>
                    <p>Starting game server...</p>
                    <p>
                        Free-tier servers sleep when idle. Usually 30–60
                        seconds.
                    </p>
                    <p>Attempt {attempt}</p>
                </>
            ) : (
                <>
                    <p>Server is taking longer than expected</p>
                    <Button onClick={() => setCheckKey((k) => k + 1)}>
                        Retry connection
                    </Button>
                </>
            )}
        </main>
    );
}
