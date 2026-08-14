import dotenv from "dotenv";
dotenv.config();

import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import { registerNotificationSocket } from "./sockets/notification.socket.js";

import app from "./app.js"; // your existing express app
import connectDB from "./config/db.js";
import registerDocumentSocket from "./sockets/document.socket.js";
import { setYSocketIO } from "./config/yjs.js";

// Connect DB
await connectDB();

// Create HTTP server (IMPORTANT)
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://livedocs-brown.vercel.app",
      process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/^["']|["']$/g, '').trim().replace(/\/$/, "") : null
    ].filter(Boolean),
    credentials: true,
  },
});

// Make io instance available to controllers
app.set('io', io);

// Setup YSocketIO for Tiptap collaboration
const ysocketio = new YSocketIO(io);
ysocketio.initialize();
setYSocketIO(ysocketio);

// Register socket logic
registerDocumentSocket(io);
registerNotificationSocket(io);
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});