/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { IConversation, IStatusLog } from "../../interface/conversation";

const ChatShow = () => {
  const { queryResult } = useShow<IConversation>({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const customer = record?.participants.find((p) => p.role === "user");
  const participants = record?.participants;

  const chatTypeMap: Record<number, string> = {
    1: "Tin nhắn hỗ trợ",
    2: "Tin nhắn đơn hàng",
    3: "Phản hồi từ người dùng",
    4: "Các loại tin nhắn khác",
  };

  const satusMap: Record<string, string> = {
    active: "Hoạt động",
    waiting: "Đang chờ",
    closed: "Đã đóng",
    default: "Không rõ",
  };

  return (
    <Show
      isLoading={isLoading}
      canDelete={false}
      title={`Thông tin đoạn chat với ${customer?.fullName}`}
    >
      <Descriptions
        bordered
        column={1}
        layout="vertical"
        labelStyle={{ fontWeight: 600 }}
      >
        <Descriptions.Item label="Tên khách hàng">
          {customer?.fullName || "Không xác định"}
        </Descriptions.Item>

        <Descriptions.Item label="Người tham gia">
          {record?.participants.map((p) => (
            <div key={p.userId}>
              <Tag color={p.role === "admin" ? "geekblue" : "green"}>
                {p.role.toUpperCase()}
              </Tag>{" "}
              {p.fullName} – Tham gia lúc{" "}
              <Typography.Text type="secondary">
                {dayjs(p.joinedAt).format("HH:mm DD/MM/YYYY")}
              </Typography.Text>
            </div>
          ))}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag
            color={
              record?.status === "active"
                ? "green"
                : record?.status === "closed"
                ? "red"
                : "yellow"
            }
          >
            {satusMap[record?.status ?? "default"] || "Không rõ"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Loại chat">
          {chatTypeMap[record?.chatType ?? 1] || "Không rõ"}
        </Descriptions.Item>

        <Descriptions.Item label="Lịch sử trạng thái">
          <Table dataSource={record?.statusLogs}>
            <Table.Column
              title="STT"
              dataIndex={"stt"}
              render={(_: unknown, __: unknown, index: number) => index + 1}
            />
            <Table.Column
              title="Trạng thái"
              dataIndex={"status"}
              filters={[
                { text: "Hoạt động", value: "active" },
                { text: "Đang chờ", value: "waiting" },
                { text: "Đã đóng", value: "closed" },
              ]}
              onFilter={(value, record) => record.status === value}
              render={(value) => (
                <Tag
                  color={
                    value === "active"
                      ? "green"
                      : value === "closed"
                      ? "red"
                      : "yellow"
                  }
                >
                  {satusMap[value] || "Không rõ"}
                </Tag>
              )}
            />
            <Table.Column
              title="Người cập nhật"
              dataIndex={"updateBy"}
              render={(value: string) => {
                const participant = participants?.find(
                  (p) => p.userId === value
                );
                return <>{participant?.fullName}</>;
              }}
            />
            <Table.Column
              title="Thời gian cập nhật"
              dataIndex={"updatedAt"}
              sorter={(a: IStatusLog, b: IStatusLog) =>
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
              }
              defaultSortOrder="descend"
              render={(value: string) => (
                <>{dayjs(value).format("HH:mm DD/MM/YYYY")}</>
              )}
            />
          </Table>
        </Descriptions.Item>

        <Descriptions.Item label="Người được phân công">
          {record?.assignedTo ? (
            <Typography.Text>{record.assignedTo}</Typography.Text>
          ) : (
            <Tag color="red">Chưa phân công</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Cập nhật lần cuối">
          {record?.lastUpdated
            ? dayjs(record.lastUpdated).format("HH:mm ~ DD/MM/YYYY")
            : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

export default ChatShow;
