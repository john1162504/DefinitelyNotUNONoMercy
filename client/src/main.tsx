import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import "./index.css";
import { ServerStartupGate } from "./components/ServerStartupGate";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ServerStartupGate>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/create" element={<CreateRoomPage />} />
                    <Route path="/room/:roomId" element={<RoomPage />} />
                </Routes>
            </BrowserRouter>
        </ServerStartupGate>
    </React.StrictMode>,
);
