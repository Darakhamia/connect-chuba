import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);
      const userId = socket.handshake.auth.userId;

      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      }

      // Join room (server or channel)
      socket.on("join_room", ({ room }: { room: string }) => {
        socket.join(room);
        console.log(`🚪 Socket ${socket.id} joined room:`, room);
        socket.to(room).emit("user_joined", { userId, socketId: socket.id });
      });

      // Leave room
      socket.on("leave_room", ({ room }: { room: string }) => {
        socket.leave(room);
        console.log(`🚪 Socket ${socket.id} left room:`, room);
        socket.to(room).emit("user_left", { userId, socketId: socket.id });
      });

      // Typing indicator
      socket.on("typing", ({ channelId, isTyping }: { channelId: string; isTyping: boolean }) => {
        socket.to(`channel:${channelId}`).emit("user_typing", {
          userId,
          channelId,
          isTyping,
        });
      });

      // Status change
      socket.on("status_change", ({ status }: { status: string }) => {
        // Broadcast to all connected clients
        io.emit("user_status_changed", { userId, status });
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
    console.log("🚀 Socket.IO server initialized");
  } else {
    console.log("✅ Socket.IO server already running");
  }

  res.end();
};

export default ioHandler;
