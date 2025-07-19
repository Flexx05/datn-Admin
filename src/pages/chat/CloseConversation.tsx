import { useInvalidate } from "@refinedev/core";
import { Button, message, Popconfirm } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
  conversationId: string;
  hiddenStatus: boolean;
};

const CloseConversation = ({ conversationId, hiddenStatus }: Props) => {
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
    } catch (error) {
      message.error("Lỗi khi khóa đoạn chat");
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
        <Button danger hidden={hiddenStatus}>
          Kết thúc
        </Button>
      </Popconfirm>
    </>
  );
};

export default CloseConversation;
