import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import { getEnv } from "../lib/env.js";
import { verifyAccessToken } from "../lib/auth.js";

export function attachSocketServer(httpServer: HttpServer) {
  const env = getEnv();

  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token;
      if (!token || typeof token !== "string") return next(new Error("Unauthorized"));
      const payload = verifyAccessToken(token, env.JWT_SECRET);
      (socket.data as any).userId = payload.sub;
      (socket.data as any).role = payload.role;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", async ({ roomId }: { roomId: string }) => {
      if (!roomId) return;
      await socket.join(roomId);
      const size = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("room:users", { count: size });
      if (size >= 2) io.to(roomId).emit("room:ready");
    });

    socket.on("signal:offer", ({ roomId, sdp }) => {
      socket.to(roomId).emit("signal:offer", { sdp });
    });
    socket.on("signal:answer", ({ roomId, sdp }) => {
      socket.to(roomId).emit("signal:answer", { sdp });
    });
    socket.on("signal:ice", ({ roomId, candidate }) => {
      socket.to(roomId).emit("signal:ice", { candidate });
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        const size = (io.sockets.adapter.rooms.get(roomId)?.size || 1) - 1;
        io.to(roomId).emit("room:users", { count: Math.max(0, size) });
      }
    });
  });

  return io;
}

