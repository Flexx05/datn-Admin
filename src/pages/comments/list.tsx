/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, ShowButton, useTable } from "@refinedev/antd";
import { LogicalFilter, useInvalidate, useUpdate } from "@refinedev/core";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Popconfirm,
  Rate,
  Space,
  Switch,
  Table,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { IComment } from "../../interface/comment";
import Loader from "../../utils/loading";
import { socket } from "../../socket";

const { RangePicker } = DatePicker;

export const CommentList = () => {
  const [form] = Form.useForm();

  const { tableProps, setFilters } = useTable({
    resource: "comments",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
  });

  const { mutate } = useUpdate();
  const [status, setStatus] = useState<string | null>(null);
  const invalidate = useInvalidate();

  // Hàm xử lý lọc
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const filters: LogicalFilter[] = [];

    // Xử lý tìm kiếm
    if (values.search?.trim()) {
      filters.push({
        field: "search",
        operator: "contains",
        value: values.search.trim(),
      });
    }

    // Xử lý thời gian
    if (values.createdAt?.length === 2) {
      filters.push({
        field: "startDate",
        operator: "eq",
        value: values.createdAt[0].format("YYYY-MM-DD"),
      });
      filters.push({
        field: "endDate",
        operator: "eq",
        value: values.createdAt[1].format("YYYY-MM-DD"),
      });
    }

    setFilters(filters, "replace");
  };

  // Lắng nghe sự kiện socket
  useEffect(() => {
    const handleChange = () => {
      invalidate({ resource: "comments", invalidates: ["list"] });
    };
    socket.on("comment-added", handleChange);
    return () => {
      socket.off("comment-added", handleChange);
    };
  });

  return (
    <List>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="search" label="Tìm kiếm">
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm hoặc người dùng"
            allowClear
            onPressEnter={handleSearch}
            onChange={(e) => {
              if (e.target.value === "") handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item name="createdAt" label="Thời gian">
          <RangePicker
            format="YYYY-MM-DD"
            allowClear
            onChange={(value) => {
              if (!value) handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSearch}>
            Lọc
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              form.resetFields();
              setFilters([], "replace");
            }}
          >
            Xóa lọc
          </Button>
        </Form.Item>
      </Form>

      <Table
        {...tableProps}
        rowKey="_id"
        loading={tableProps.loading ? { indicator: <Loader /> } : false}
      >
        <Table.Column
          dataIndex="_id"
          title="STT"
          render={(_text, _record, index) => index + 1}
        />

        <Table.Column
          title="Sản phẩm"
          dataIndex={["productId", "name"]}
          key="productName"
          render={(_text, record: IComment) =>
            record.productId &&
            typeof record.productId === "object" &&
            "name" in record.productId ? (
              (record.productId as { name: string }).name
            ) : (
              <span style={{ color: "red" }}>Sản phẩm không tồn tại</span>
            )
          }
        />

        <Table.Column
          title="Người dùng"
          dataIndex={["userId", "fullName"]}
          key="userName"
        />

        <Table.Column
          dataIndex="content"
          title="Nội dung"
          render={(text: string | undefined | null) => {
            if (!text || text.trim() === "") {
              return (
                <i style={{ color: "gray" }}>Không có nội dung đánh giá</i>
              );
            }
            return text.length > 50 ? text.slice(0, 50) + "..." : text;
          }}
        />

        <Table.Column
          dataIndex="rating"
          title="Đánh giá"
          filters={[
            { text: "1 sao", value: 1 },
            { text: "2 sao", value: 2 },
            { text: "3 sao", value: 3 },
            { text: "4 sao", value: 4 },
            { text: "5 sao", value: 5 },
          ]}
          onFilter={(value, record) => record.rating === value}
          render={(value: number) => (
            <Rate disabled value={value} style={{ fontSize: "15px" }} />
          )}
        />

        <Table.Column
          dataIndex="status"
          title="Trạng thái"
          filters={[
            { text: "Hiển thị", value: "visible" },
            { text: "Ẩn", value: "hidden" },
          ]}
          onFilter={(value, record) => record.status === value}
          render={(value: string, record: IComment) => {
            const isVisible = value === "visible";
            const isProductDeleted = !record.productId;
            const switchDisabled = !isVisible && isProductDeleted;
            return (
              <Popconfirm
                title="Bạn có chắc muốn ẩn bình luận này không?"
                onConfirm={() => {
                  const newStatus = isVisible ? "hidden" : "visible";
                  setStatus(String(record._id));
                  mutate(
                    {
                      resource: "comments",
                      id: record._id,
                      values: { status: newStatus },
                    },
                    {
                      onSuccess: () => {
                        message.success("Cập nhật trạng thái thành công");
                        setStatus(null);
                      },
                      onError: () => {
                        message.error("Cập nhật trạng thái thất bại");
                        setStatus(null);
                      },
                    }
                  );
                }}
                disabled={!isVisible}
              >
                <Tooltip
                  title={
                    switchDisabled
                      ? "Không thể chuyển sang trạng thái hiển thị vì sản phẩm đã bị xóa"
                      : ""
                  }
                >
                  <span>
                    <Switch
                      checked={isVisible}
                      checkedChildren="Hiện"
                      unCheckedChildren="Ẩn"
                      loading={status === String(record._id)}
                      disabled={switchDisabled}
                      onChange={(checked) => {
                        if (!checked && isVisible) {
                          // Nếu chuyển từ hiện sang ẩn thì show confirm
                        } else {
                          // Nếu chuyển từ ẩn sang hiện mà sản phẩm đã bị xóa thì không làm gì
                          if (checked && isProductDeleted) {
                            return;
                          }
                          const newStatus = checked ? "visible" : "hidden";
                          setStatus(String(record._id));
                          mutate(
                            {
                              resource: "comments",
                              id: record._id,
                              values: { status: newStatus },
                            },
                            {
                              onSuccess: () => {
                                message.success(
                                  "Cập nhật trạng thái thành công"
                                );
                                setStatus(null);
                              },
                              onError: () => {
                                message.error("Cập nhật trạng thái thất bại");
                                setStatus(null);
                              },
                            }
                          );
                        }
                      }}
                    />
                  </span>
                </Tooltip>
              </Popconfirm>
            );
          }}
        />

        <Table.Column
          dataIndex="adminReply"
          title="Phản hồi"
          render={(_text: string, record: any) => {
            const reply = record.adminReply || "";
            const isLong = reply.length > 50;
            const shortReply = isLong ? reply.slice(0, 50) + "..." : reply;

            return reply ? (
              <div>
                <p style={{ marginBottom: 4 }}>{shortReply}</p>
                {record.replyAt && (
                  <small style={{ color: "#666" }}>
                    {new Date(record.replyAt).toLocaleString()}
                  </small>
                )}
              </div>
            ) : (
              <span style={{ color: "#999" }}>Chưa phản hồi</span>
            );
          }}
        />

        <Table.Column
          dataIndex="createdAt"
          title="Thời gian tạo"
          render={(value: string) => new Date(value).toLocaleString()}
          sorter={(a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
        />
        <Table.Column<IComment>
          title="Thao tác"
          dataIndex="actions"
          render={(_, record: IComment) => (
            <Space>
              <ShowButton hideText size="middle" recordItemId={record._id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
