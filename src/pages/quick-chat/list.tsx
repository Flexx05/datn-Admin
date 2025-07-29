/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeOutlined } from "@ant-design/icons";
import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { Button, Input, Space, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { IQuickChat } from "../../interface/conversation";
import { QuickChatShow } from "./show";
import Loader from "../../utils/loading";

const QuickChatList = () => {
  const { tableProps, setFilters } = useTable<IQuickChat>({
    syncWithLocation: true,
    onSearch: (value) => [
      {
        field: "search",
        operator: "contains",
        value,
      },
    ],
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + error.response?.data?.error,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleShow = (id: string) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const categoryMap: Record<number, string> = {
    1: "Chung",
    2: "Đơn hàng",
    3: "Thanh toán",
    4: "Vận chuyển",
    5: "Hóa đơn",
    6: "Khác",
  };

  return (
    <>
      <List title={"Quản lý tin nhắn nhanh"}>
        <Input.Search
          placeholder="Tìm kiếm tin nhắn"
          allowClear
          onSearch={(value) => {
            setFilters([
              {
                field: "search",
                operator: "contains",
                value,
              },
            ]);
          }}
          style={{ marginBottom: 16, maxWidth: 300 }}
        />
        <Table
          {...tableProps}
          rowKey={"_id"}
          loading={tableProps.loading ? { indicator: <Loader /> } : false}
        >
          <Table.Column
            dataIndex={"stt"}
            title="STT"
            render={(_unknown, _: IQuickChat, index: number) => index + 1}
          />
          <Table.Column
            dataIndex={"content"}
            title="Nội dung"
            render={(value: string) =>
              value.length > 50 ? value.slice(0, 50) + "..." : value
            }
          />
          <Table.Column
            dataIndex={"category"}
            title="Mục"
            filters={[
              { text: "Chung", value: 1 },
              { text: "Đơn hàng", value: 2 },
              { text: "Thanh toán", value: 3 },
              { text: "Vận chuyển", value: 4 },
              { text: "Hóa đơn", value: 5 },
              { text: "Khác", value: 6 },
            ]}
            onFilter={(value, record) => record.category === value}
            render={(value: number) => categoryMap[value]}
          />
          <Table.Column
            dataIndex={"createdBy"}
            title="Người tạo"
            render={(value: any) => value.fullName}
          />
          <Table.Column
            dataIndex={"createdAt"}
            title="Ngày tạo"
            sorter={(a: IQuickChat, b: IQuickChat) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            }
            defaultSortOrder={"descend"}
            render={(value: string) =>
              dayjs(value).format("HH:mm - DD/MM/YYYY")
            }
          />
          <Table.Column
            dataIndex={"action"}
            title="Hành động"
            render={(_: unknown, record: IQuickChat) => (
              <Space>
                <Tooltip title="Chỉnh sửa tin nhắn">
                  <EditButton hideText size="small" recordItemId={record._id} />
                </Tooltip>
                <Tooltip title="Xem chi tiết">
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    type="default"
                    onClick={() => handleShow(record._id)}
                  />
                </Tooltip>
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  confirmTitle="Bạn chắc chắn xóa tin nhắn này không?"
                  confirmCancelText="Hủy"
                  confirmOkText="Xóa"
                />
              </Space>
            )}
          />
        </Table>
      </List>
      <QuickChatShow
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setSelectedId(null);
        }}
        recordId={selectedId}
      />
    </>
  );
};

export default QuickChatList;
