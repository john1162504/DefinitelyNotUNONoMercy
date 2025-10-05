import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.DEV
    ? "http://localhost:3001"
    : "https://definitelynotunonomercy.onrender.com";

// Generate or reuse a session ID stored locally
let sessionId = localStorage.getItem("sessionId");
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
}

export const socket = io(SERVER_URL, {
    transports: ["websocket"],
    auth: { sessionId },
});

export default socket;
