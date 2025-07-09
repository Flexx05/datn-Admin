/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useAuth } from "../contexts/auth/AuthContext";
import { socket } from "./socket";

export const useChatSocket = (onNewMessage: (msg: any) => void) => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join-room", user._id);
    socket.on("newChatMessage", onNewMessage);
    return () => {
      socket.off("newChatMessage", onNewMessage);
    };
  }, [user?._id, onNewMessage]);
};
