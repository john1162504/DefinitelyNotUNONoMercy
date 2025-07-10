import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { handleRoomSockets } from "./controllers/LobbyController";
import { handleGameSockets } from "./controllers/GameController";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "https://john1162504.github.io/DefinitelyNotUNONoMercy",
            "http://localhost:5173",
        ],
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.get("/", (_req: Request, res: Response) => {
    res.send("UNO server is running!");
});

io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);
    handleRoomSockets(io, socket);
    handleGameSockets(io, socket);
});

server.listen(3000, () => {
    console.log("🚀 Server listening on http://localhost:3000");
});
