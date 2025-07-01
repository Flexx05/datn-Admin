/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import axios from "axios";
import { useContext, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { API_URL } from "../config/dataProvider";
import { ColorModeContext } from "../contexts/color-mode";
import { INotification } from "../interface/notification";
import { statusMap } from "../pages/dashboard/statusMap";
import { socket } from "./socket";

const handleChangReadingStatus = async (data: INotification) => {
  await axios.patch(`${API_URL}/notification/${data._id}`);

  window.location.href = `/orders/show/${data.orderId}`;
};

export const useNontificationSocket = () => {
  const { mode } = useContext(ColorModeContext);
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
      notification.info({
        message: "Thông báo mới",
        description:
          data && data.type === "order"
            ? `Khách hàng: ${data.userName} đã đặt đơn hàng ${data.orderCode}`
            : `Đơn hàng: ${data?.orderCode} ${
                statusMap[data?.orderStatus]?.text
              }\nNgười thực hiện: ${data?.userName}`,
        style: { backgroundColor: colorMode },
        placement: "bottomLeft",
        onClick: () => handleChangReadingStatus(data),
      });
    });
    socket.on("disconnect", () => {
      console.log("[socket] Disconnected from admin server");
    });
    return () => {
      socket.off("new-nontification");
      socket.off("disconnect");
    };
  }, [colorMode]);
};
