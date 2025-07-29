/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";
import { useInvalidate } from "@refinedev/core";

type Props = {
  conversationId: string;
};
const UnAssignConversation = ({ conversationId }: Props) => {
  const invalidate = useInvalidate();
  const handleUnAssignConversation = async () => {
    try {
      await axiosInstance.patch(`/conversation/un-assign/${conversationId}`);
      invalidate({
        resource: "conversation",
        id: conversationId,
        invalidates: ["list", "detail"],
      });
      message.success("Hủy đăng ký thành công");
    } catch (error: any) {
      message.error("Lỗi khi hủy đăng ký");
    }
  };
  return (
    <>
      <Popconfirm
        title="Hủy đăng ký"
        description={`Bạn chắc chắn hủy đăng ký đoạn chat này không?`}
        onConfirm={handleUnAssignConversation}
      >
        <Button>Hủy đăng ký</Button>
      </Popconfirm>
    </>
  );
};

export default UnAssignConversation;
