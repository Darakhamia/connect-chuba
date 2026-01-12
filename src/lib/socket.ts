// WebSocket client singleton for real-time communication

import { io, Socket } from "socket.io-client";

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string) {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return this.socket;
    }

    console.log("🔌 Connecting to WebSocket...");

    this.socket = io(process.env.NEXT_PUBLIC_SITE_URL || "", {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"], // Prefer WebSocket
      auth: {
        userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();

    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 WebSocket reconnected after", attemptNumber, "attempts");
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting WebSocket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error("❌ Socket not connected, cannot emit:", event);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Join a room (server or channel)
  joinRoom(room: string) {
    this.emit("join_room", { room });
    console.log("🚪 Joined room:", room);
  }

  // Leave a room
  leaveRoom(room: string) {
    this.emit("leave_room", { room });
    console.log("🚪 Left room:", room);
  }

  // Send typing indicator
  sendTyping(channelId: string, isTyping: boolean) {
    this.emit("typing", { channelId, isTyping });
  }

  // Send status update
  updateStatus(status: "online" | "idle" | "dnd" | "offline") {
    this.emit("status_change", { status });
  }
}

// Singleton instance
export const socketClient = new SocketClient();
