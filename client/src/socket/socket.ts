import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.DEV
    ? "http://localhost:3001"
    : "https://uno-backend.onrender.com";

export const socket = io(SERVER_URL, { transports: ["websocket"] });
export default socket;
