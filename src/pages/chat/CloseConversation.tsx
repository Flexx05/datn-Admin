/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInvalidate } from "@refinedev/core";
import { Button, message, Popconfirm } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
  conversationId: string;
  disableStatus?: boolean;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
  hiddenStatus?: boolean;
};

const CloseConversation = ({
  conversationId,
  buttonType,
  disableStatus,
  hiddenStatus,
}: Props) => {
  const invalidate = useInvalidate();
  const handleCloseConversation = async () => {
    try {
      await axiosInstance.patch(`/conversation/closed/${conversationId}`);
      message.success("Đoạn chat đã được kết thúc");
      invalidate({
        resource: "conversation",
        id: conversationId,
        invalidates: ["list", "detail"],
      });
    } catch (error: any) {
      message.error("Lỗi khi khóa đoạn chat\n" + error.response?.data?.error);
    }
  };
  return (
    <>
      <Popconfirm
        title="Kết thúc đoạn chat"
        description="Bạn chắc chắn kết thúc đoạn chat này không?"
        onConfirm={handleCloseConversation}
        okText="Kết thúc"
        cancelText="Hủy"
      >
        <Button
          type={buttonType}
          danger
          disabled={disableStatus}
          hidden={hiddenStatus}
        >
          Kết thúc
        </Button>
      </Popconfirm>
    </>
  );
};

export default CloseConversation;
