import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import RulesPage from "./pages/RulesPage";
import "./index.css";
import { ServerStartupGate } from "./components/ServerStartupGate";

// React Router expects basename without a trailing slash; Vite BASE_URL always
// includes one (e.g. "/DefinitelyNotUNONoMercy/").
const routerBasename =
    import.meta.env.BASE_URL === "/"
        ? undefined
        : import.meta.env.BASE_URL.replace(/\/$/, "");

// Static pages (home, rules) render immediately. Only routes that talk to the
// game server are wrapped in the startup gate so they aren't blocked by /health.
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter basename={routerBasename}>
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${import.meta.env.BASE_URL}assets/Backgrounds/background_2.png')`,
                }}
            >
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route
                    path="/create"
                    element={
                        <ServerStartupGate>
                            <CreateRoomPage />
                        </ServerStartupGate>
                    }
                />
                <Route
                    path="/room/:roomId"
                    element={
                        <ServerStartupGate>
                            <RoomPage />
                        </ServerStartupGate>
                    }
                />
            </Routes>
            </div>
        </BrowserRouter>
    </React.StrictMode>,
);
