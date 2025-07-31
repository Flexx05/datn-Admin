/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm } from "antd";
import { axiosInstance } from "../../utils/axiosInstance";
import { useInvalidate } from "@refinedev/core";

type Props = {
  conversationId: string;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
  staffId: string;
};
const UnAssignConversation = ({
  conversationId,
  buttonType,
  staffId,
}: Props) => {
  const invalidate = useInvalidate();
  const handleUnAssignConversation = async () => {
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
        description={`Bạn chắc chắn hủy đăng ký đoạn chat này không?`}
        onConfirm={handleUnAssignConversation}
      >
        <Button type={buttonType}>Hủy đăng ký</Button>
      </Popconfirm>
    </>
  );
};

export default UnAssignConversation;
