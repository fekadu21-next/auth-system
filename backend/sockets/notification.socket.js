const onlineUsers = new Map();

const registerNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔔 Notification socket connected:", socket.id);

    // REGISTER USER — join a per-user room (`user:<id>`) so notifications are
    // delivered to EVERY tab/window of the user (dashboard + document pages)
    // in real time, not just the most recently connected socket.
    socket.on("register-user", (userId) => {
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online (room user:${userId})`);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        socket.leave(`user:${userId}`);
        if (onlineUsers.get(userId) === socket.id) {
          onlineUsers.delete(userId);
        }
      }

      console.log("User disconnected:", socket.id);
    });
  });
};

export { registerNotificationSocket, onlineUsers };