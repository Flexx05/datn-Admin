/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Input, Space, Table, Tooltip } from "antd";
import { IQuickChat } from "../../interface/conversation";
import dayjs from "dayjs";

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
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message | error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });

  const categoryMap: Record<number, string> = {
    1: "Chung",
    2: "Đơn hàng",
    3: "Thanh toán",
    4: "Vận chuyển",
    5: "Hóa đơn",
    6: "Khác",
  };

  return (
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
      <Table {...tableProps} rowKey={"_id"}>
        <Table.Column
          dataIndex={"stt"}
          title="STT"
          render={(_unknown, _: IQuickChat, index: number) => index + 1}
        />
        <Table.Column dataIndex={"content"} title="Nội dung" />
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
          render={(value: string) => dayjs(value).format("HH:mm - DD/MM/YYYY")}
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
                <ShowButton hideText size="small" recordItemId={record._id} />
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
  );
};

export default QuickChatList;
