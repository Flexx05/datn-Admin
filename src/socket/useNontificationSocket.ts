/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import axios from "axios";
import { useContext, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { API_URL } from "../config/dataProvider";
import { ColorModeContext } from "../contexts/color-mode";
import { INotification } from "../interface/notification";
import { socket } from "./socket";
import { useAuth } from "../contexts/auth/AuthContext";

const handleChangReadingStatus = async (data: INotification) => {
  await axios.patch(`${API_URL}/notification/${data._id}`);

  window.location.href =
    data.type === 0 || data.type === 1 ? `/orders/show/${data.link}` : ``;
};

export const useNontificationSocket = () => {
  const { mode } = useContext(ColorModeContext);
  const { user } = useAuth();
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join-admin-room");
    });
    socket.off("new-nontification");
    socket.on("new-nontification", (data) => {
      console.log("[socket] Received new-nontification:", data);
      if (
        (data.recipientId === null || data.recipientId === user?._id) &&
        data.type !== 3
      ) {
        notification.info({
          message: data.title,
          description: data.message,
          placement: "bottomLeft",
          onClick: () => handleChangReadingStatus(data),
        });
      }
    });
    socket.on("disconnect", () => {
      console.log("[socket] Disconnected from admin server");
    });
    return () => {
      socket.off("new-nontification");
      socket.off("disconnect");
    };
  }, [colorMode, user]);
};
