import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "https://collaboration-editor-yfm8.onrender.com";

export const socket = io(URL, {
  withCredentials: true,
});