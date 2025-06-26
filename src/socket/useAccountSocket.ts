import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/auth/AuthContext";
import { socket } from "./socket";
export const useAccountSocket = () => {
  const { user, logout } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = socket;

    console.log("[socket] Connecting to server...");

    socket.on("connect", () => {
      console.log("[socket] Connected to server", socket.id);
      socket.emit("check-account-status", user?._id);
    });

    socket.connect();

    socket.on("account-status", (data) => {
      console.log("[socket] Received account-status:", data);

      if (!data.isActive) {
        Swal.fire({
          icon: "error",
          title: "Rất tiếc...",
          text: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để giải quyết.",
          confirmButtonText: "OK",
        }).then(() => {
          logout();
          window.location.href = "/login";
        });
      }
    });
    socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected from server:", reason);
    });

    socket.on("connect_error", (error) => {
      console.log("[socket] Error:", error.message);
    });

    socket.io.on("error", (err) => {
      console.log("❌ [socket] IO error:", err.message);
    });

    socket.io.on("reconnect_attempt", () => {
      console.log("🔁 [socket] Trying to reconnect...");
    });

    return () => {
      console.log("[socket] Disconnecting from server...");
      socket.disconnect();
    };
  }, [user?._id, logout]);
};
