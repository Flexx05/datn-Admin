import { useEffect, useRef } from "react";
import { socket } from "./socket";
import { Socket } from "socket.io-client";
import { notification } from "antd";

export const useNontificationSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("[socket] Connected to admin server", socket.id);
      socket.emit("join-admin-room");
    });
    socket.on("new-nontification", (data) => {
      console.log("[socket] Received new-nontification:", data);
      notification.info({
        message: "Thông báo mới",
        description: data.content,
      });
    });
    socket.on("disconnect", () => {
      console.log("[socket] Disconnected from admin server");
    });
    return () => {
      socket.disconnect();
    };
  }, []);
};
