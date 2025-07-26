/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Descriptions, Modal, Spin } from "antd";
import { useShow } from "@refinedev/core";
import { IQuickChat } from "../../interface/conversation";
import dayjs from "dayjs";
import Loader from "../../utils/loading";

interface QuickChatModalShowProps {
  open: boolean;
  onCancel: () => void;
  recordId: string | null;
}

const categoryMap: Record<number, string> = {
  1: "Chung",
  2: "Đơn hàng",
  3: "Thanh toán",
  4: "Vận chuyển",
  5: "Hóa đơn",
  6: "Khác",
};

export const QuickChatShow: React.FC<QuickChatModalShowProps> = ({
  open,
  onCancel,
  recordId,
}) => {
  const { queryResult } = useShow<IQuickChat>({
    resource: "quick-chat",
    id: recordId!,
    queryOptions: {
      enabled: !!recordId,
    },
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " +
        (error.response?.data?.message || error.response?.data?.error),
      description: "Có lỗi xảy ra trong quá trình xử lý",
      type: "error",
    }),
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Chi tiết tin nhắn"
    >
      <Spin spinning={isLoading} indicator={<Loader />}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Nội dung">
            {record?.content || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {record?.category !== undefined
              ? categoryMap[record.category]
              : "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {record?.createdBy?.fullName || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Người cập nhật">
            {record?.updatedBy?.fullName || "Không xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {record?.createdAt
              ? dayjs(record.createdAt).format("HH:mm DD/MM/YYYY")
              : "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {record?.updatedAt
              ? dayjs(record.updatedAt).format("HH:mm DD/MM/YYYY")
              : "Không có"}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </Modal>
  );
};
