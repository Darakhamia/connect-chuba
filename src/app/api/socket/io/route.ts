import { Server as NetServer } from "http";
import { NextRequest } from "next/server";
import { Server as ServerIO } from "socket.io";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let io: ServerIO | undefined;

export async function GET(req: NextRequest) {
  if (!io) {
    // @ts-ignore
    const httpServer: NetServer = (req as any).socket?.server as NetServer;
    io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
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
        // Broadcast to all friends
        io?.emit("user_status_changed", { userId, status });
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    console.log("🚀 Socket.IO server initialized");
  }

  return new Response("Socket.IO server is running", {
    status: 200,
  });
}
