import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// In production the app is served from the GitHub Pages project subpath
// (https://<user>.github.io/DefinitelyNotUNONoMercy/), so assets and routes
// must be prefixed with that base. Locally we serve from root.
export default defineConfig(({ command }) => ({
    base: command === "build" ? "/DefinitelyNotUNONoMercy/" : "/",
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
}));
