"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const LobbyController_1 = require("./controllers/LobbyController");
const GameController_1 = require("./controllers/GameController");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            "https://john1162504.github.io/DefinitelyNotUNONoMercy",
            "http://localhost:5173",
        ],
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
app.get("/", (_req, res) => {
    res.send("UNO server is running!");
});
io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);
    (0, LobbyController_1.handleRoomSockets)(io, socket);
    (0, GameController_1.handleGameSockets)(io, socket);
});
server.listen(3000, () => {
    console.log("🚀 Server listening on http://localhost:3000");
});
