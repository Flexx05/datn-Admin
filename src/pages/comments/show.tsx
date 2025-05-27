import { useUpdate } from "@refinedev/core";
import { useShow } from "@refinedev/core";
import {
  Typography,
  Descriptions,
  Divider,
  Rate,
  Switch,
  message,
  Form,
  Input,
  Button,
} from "antd";
import {
  CalendarOutlined,
  MailOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { useEffect, useState } from "react";

const { Title } = Typography;

export const CommentShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading, refetch } = queryResult;
  const record = data?.data;
  const { mutate } = useUpdate();

  const [updateStatus, setStatus] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);

  const [form] = Form.useForm();
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        replyContent: record.replyContent || "",
      });
    }
  }, [record, form]);

  const handleToggleStatus = (checked: boolean) => {
    if (!record) return;

    const newStatus = checked ? "visible" : "hidden";
    setStatus(String(record._id));

    mutate(
      {
        resource: "comments",
        id: record._id,
        values: {
          status: newStatus,
        },
      },
      {
        onSuccess: () => {
          message.success("Cập nhật trạng thái thành công");
          setStatus(null);
          refetch?.();
        },
        onError: () => {
          message.error("Cập nhật trạng thái thất bại");
          setStatus(null);
        },
      }
    );
  };

  const handleReply = (values: { replyContent: string }) => {
    if (!record) return;
    setReplyLoading(true);
    mutate(
      {
        resource: "comments/reply",
        id: record._id,
        values: {
          replyContent: values.replyContent,
          replyAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          message.success("Gửi phản hồi thành công");
          setReplyLoading(false);
          refetch?.();
          form.resetFields();
        },
        onError: (error:any) => {
          message.error(
            error?.response?.data?.message || "Gửi phản hồi thất bại"
          );
          setReplyLoading(false);
        },
      }
    );
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={4}>Chi tiết bình luận</Title>
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "180px" }}
        contentStyle={{ whiteSpace: "pre-wrap" }}
      >
        <Descriptions.Item label="ID">{record?._id}</Descriptions.Item>
        <Descriptions.Item label="Tên sản phẩm">
          {record?.productId?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Người bình luận">
          <UserOutlined /> {record?.userId?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Email người dùng">
          <MailOutlined /> {record?.userId?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung bình luận">
          <CommentOutlined /> {record?.content}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Switch
            checked={record?.status === "visible"}
            checkedChildren="Hiện"
            unCheckedChildren="Ẩn"
            loading={updateStatus === String(record?._id)}
            onChange={handleToggleStatus}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Số sao đánh giá">
          <Rate disabled value={record?.rating || 0} />
        </Descriptions.Item>
      </Descriptions>

      <Divider>Phản hồi của Admin</Divider>

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "180px" }}
        contentStyle={{ whiteSpace: "pre-wrap" }}
      >
       <Descriptions.Item label="Trả lời">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleReply}
        style={{ marginTop: "10px" }}
        initialValues={{ replyContent: record?.replyContent || "" }}
      >
        <Form.Item
          name="replyContent"
          label="Trả lời bình luận"
          rules={[{ required: true, message: "Vui lòng nhập phản hồi!" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={
              record?.status === "visible"
                ? "Nhập phản hồi của bạn tại đây..."
                : "Chỉ có thể trả lời khi bình luận đã được duyệt"
            }
            style={{ width: "100%", resize: "none" }}
            disabled={record?.status !== "visible"}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={replyLoading}
            disabled={record?.status !== "visible"}
            style={{ marginTop: "10px" }}
          >
            {record?.replyContent ? "Cập nhật phản hồi" : "Gửi phản hồi"}
          </Button>
        </Form.Item>
      </Form>
    </Descriptions.Item>

        <Descriptions.Item label="Thời gian trả lời">
          {record?.replyAt ? (
            <span>
              <CalendarOutlined /> {new Date(record.replyAt).toLocaleString()}
            </span>
          ) : (
            "Chưa trả lời"
          )}
        </Descriptions.Item>
      </Descriptions>
      <Divider />

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "180px" }}
      >
        <Descriptions.Item label="Ngày tạo bình luận">
          <CalendarOutlined />{" "}
          {record?.createdAt
            ? new Date(record.createdAt).toLocaleString()
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};