import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../config/serverUrl";

// Generate or reuse a session ID stored locally
let sessionId = localStorage.getItem("sessionId");
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
}

let socket: Socket | null = null;

export function initSocket(): Socket {
    if (!socket) {
        socket = io(SERVER_URL, {
            transports: ["websocket"],
            auth: { sessionId },
        });
    }

    return socket;
}

export function getSocket(): Socket {
    if (!socket) {
        throw new Error("Socket not initialised yet");
    }
    return socket;
}

export function isSocketInitialised(): boolean {
    return socket !== null;
}

export function getSessionId(): string {
    return sessionId!;
}

export default getSocket;
