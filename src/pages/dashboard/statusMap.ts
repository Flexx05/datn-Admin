import {
  ShoppingOutlined,
  CheckOutlined,
  TruckOutlined,
  CloseOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import React from "react";

export const statusMap: Record<
  number | string,
  { text: string; color: string; icon: React.ReactNode }
> = {
  0: {
    text: "Chờ xác nhận",
    color: "orange",
    icon: React.createElement(ShoppingOutlined),
  },
  1: {
    text: "Đã xác nhận",
    color: "blue",
    icon: React.createElement(CheckOutlined),
  },
  2: {
    text: "Đang giao hàng",
    color: "purple",
    icon: React.createElement(TruckOutlined),
  },
  3: {
    text: "Đã giao hàng",
    color: "yellow",
    icon: React.createElement(CheckOutlined),
  },
  4: {
    text: "Hoàn thành",
    color: "green",
    icon: React.createElement(CheckOutlined),
  },
  5: { text: "Đã huỷ", color: "red", icon: React.createElement(CloseOutlined) },
  6: {
    text: "Hoàn hàng",
    color: "cyan",
    icon: React.createElement(UndoOutlined),
  },
  default: {
    text: "Không xác định",
    color: "default",
    icon: null,
  },
};
