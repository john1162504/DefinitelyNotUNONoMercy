export const SERVER_URL = import.meta.env.DEV
    ? "http://localhost:3001"
    : import.meta.env.VITE_SERVER_URL || "";
