/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";
import { useInvalidate } from "@refinedev/core";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useEffect, useState } from "react";

type Props = {
  conversationId: string;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
  staffId: string;
  lastUpdated: string;
  assignedTo: string;
};
const UnAssignConversation = ({
  conversationId,
  buttonType,
  staffId,
  lastUpdated,
  assignedTo,
}: Props) => {
  const invalidate = useInvalidate();
  const { user } = useAuth();

  // Lấy thông tin đăng ký từ context/messages
  const [canUnassign, setCanUnassign] = useState<boolean>(true);
  useEffect(() => {
    if (user?.role === "admin") {
      // Nếu có assignedAt, kiểm tra thời gian
      if (assignedTo && lastUpdated) {
        const now = Date.now();
        const assignedTime = new Date(lastUpdated).getTime();
        const diffMinutes = (now - assignedTime) / (1000 * 60);
        setCanUnassign(diffMinutes >= 30);
      } else {
        setCanUnassign(false);
      }
    } else {
      setCanUnassign(true);
    }
  }, [user, lastUpdated, assignedTo]);

  const handleUnAssignConversation = async () => {
    if (user?.role === "admin" && !canUnassign) {
      message.error("Chưa thể hủy đăng ký.");
      return;
    }
    try {
      await axiosInstance.patch(`/conversation/un-assign/${conversationId}`, {
        staffId,
      });
      invalidate({
        resource: "conversation",
        id: conversationId,
        invalidates: ["list", "detail"],
      });
      message.success("Hủy đăng ký thành công");
    } catch (error: any) {
      message.error("Lỗi khi hủy đăng ký\n" + error.response?.data?.error);
    }
  };
  return (
    <>
      <Popconfirm
        title="Hủy đăng ký"
        description={
          user?.role === "admin" && !canUnassign
            ? "Admin chỉ được hủy đăng ký sau 30 phút kể từ khi đăng ký."
            : `Bạn chắc chắn hủy đăng ký đoạn chat này không?`
        }
        onConfirm={handleUnAssignConversation}
        disabled={user?.role === "admin" && !canUnassign}
      >
        <Button
          type={buttonType}
          disabled={user?.role === "admin" && !canUnassign}
        >
          Hủy đăng ký
        </Button>
      </Popconfirm>
    </>
  );
};

export default UnAssignConversation;
