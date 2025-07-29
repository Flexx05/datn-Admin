/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInvalidate } from "@refinedev/core";
import { Button, message } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
  conversationId: string;
  disabledStatus: boolean;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
};

const AssignConversation = ({
  conversationId,
  disabledStatus,
  buttonType,
}: Props) => {
  const invalidate = useInvalidate();

  const handleAssignConversation = async () => {
    try {
      await axiosInstance.patch(`/conversation/assign/${conversationId}`);
      message.success("Đăng ký thành công");
      invalidate({
        resource: "conversation",
        id: conversationId,
        invalidates: ["list", "detail"],
      });
    } catch (error: any) {
      message.error("Lỗi khi đăng ký đoạn chat");
    }
  };

  return (
    <>
      <Button
        type={buttonType}
        onClick={handleAssignConversation}
        disabled={disabledStatus}
      >
        Đăng ký
      </Button>
    </>
  );
};

export default AssignConversation;
