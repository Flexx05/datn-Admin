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
  Button, Popconfirm, Image, Space,
  Checkbox
} from "antd";
import {
  CalendarOutlined,
  MailOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const { Title } = Typography;

export const CommentShow = () => {
  const { queryResult } = useShow();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = queryResult;
  const record = data?.data;
  const { mutate } = useUpdate();
   
  // Set loading cho việc cập nhật trạng thái bình luận
  const [status, setStatus] = useState<string | null>(null);
  // Set loading cho việc gửi phản hồi
  const [replyLoading, setReplyLoading] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        adminReply: record.adminReply || "",
        sendEmail: !record.adminReply, // Mặc định là true nếu chưa có phản hồi
      });
    }
  }, [record, form]);
  
  // Hàm xử lý cập nhật trạng thái bình luận
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
  
  // Hàm xử lý gửi phản hồi bình luận
  const handleReply = (values: { adminReply: string, sendEmail: boolean }) => {
    if (!record) return;
    setReplyLoading(true);
    mutate(
      {
        resource: "comments/reply",
        id: record._id,
        values: {
          adminReply: values.adminReply,
          sendEmail: values.sendEmail,
        },
      },
      {
        onSuccess: () => {
          message.success("Gửi phản hồi thành công");
          setReplyLoading(false);
          refetch?.();
          form.resetFields();
          setTimeout(() => {
            navigate("/comments");
          }, 1500)
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
    <Show isLoading={isLoading} canDelete={false}>
      <Title level={4}>Chi tiết bình luận</Title>
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "180px" }}
        contentStyle={{ whiteSpace: "pre-wrap" }}
      >

        <Descriptions.Item label="Tên sản phẩm">
          {record?.productId?.name}
        </Descriptions.Item>

        <Descriptions.Item label="Phân loại">
        {record?.variationInfo?.attributes?.length > 0 ? (
           (record?.variationInfo?.attributes || record?.attributes || []).map((attr:any, index:any) => (
            <div key={index}>
              {attr.name}: {attr.value}
            </div>
          ))
          ) : (
            <span>
            Không có thông tin biến thể
            </span>
          )}
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

        <Descriptions.Item label="Ảnh/Video đính kèm">
          {record?.images && record.images.length > 0 ? (
            <Space>
              {[...record.images]
                .sort((a, b) => {
                  const isVideoA = /\.(mp4|webm|ogg)$/i.test(a);
                  const isVideoB = /\.(mp4|webm|ogg)$/i.test(b);
                  return isVideoB ? 1 : isVideoA ? -1 : 0; // Video lên trước
                })
                .map((media: string, index: number) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(media);
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(media);

                  return isImage ? (
                    <Image
                      key={index}
                      src={media}
                      alt={`Ảnh ${index + 1}`}
                      width={150}
                      height={150}
                      style={{ objectFit: 'cover' }}
                      preview
                    />
                  ) : isVideo ? (
                    <video
                      key={index}
                      width={200}
                      height={200}
                      controls
                      style={{ objectFit: 'cover' }}
                    >
                      <source src={media} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  ) : (
                    <span key={index}>Không hỗ trợ định dạng</span>
                  );
                })}
            </Space>
          ) : (
            "Không có ảnh hoặc video"
          )}
        </Descriptions.Item>



        <Descriptions.Item label="Đánh giá">
          <Rate disabled value={record?.rating || 0} style={{fontSize: "20px"}} />
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Popconfirm
            title="Bạn có chắc muốn ẩn bình luận này không?"
            onConfirm={() => handleToggleStatus(false)}
            disabled={record?.status !== "visible"}
          >
            <Switch
              checked={record?.status === "visible"}
              checkedChildren="Hiện"
              unCheckedChildren="Ẩn"
              loading={status === String(record?._id)}
              onChange={(checked) => {
                if (!checked && record?.status === "visible") {
                  // Nếu chuyển từ hiện sang ẩn thì show Popconfirm (không làm gì ở đây)
                } else {
                  // Chuyển từ ẩn sang hiện thì cập nhật luôn
                  handleToggleStatus(checked);
                }
              }}
            />
          </Popconfirm>
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
        >
          <Form.Item
            name="adminReply"
            label="Trả lời bình luận"
            rules={[{ required: true, message: "Vui lòng nhập phản hồi!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập phản hồi của bạn tại đây..."
              disabled={record?.status !== "visible"}
            />
          </Form.Item>
          
          {record?.status !== "visible" && (
            <div style={{ color: "red", marginBottom: 10 }}>
              Bình luận phải được duyệt trước khi trả lời.
            </div>
          )}

          <Form.Item
            name="sendEmail"
            valuePropName="checked"
          >
            <Checkbox disabled={record?.status !== "visible"}>
              Gửi email thông báo cho khách hàng
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={replyLoading}
              disabled={record?.status !== "visible"}
              style={{ marginTop: "10px" }}
            >
              {record?.adminReply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
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
            "Chưa phản hồi"
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
        <Descriptions.Item label="Thời gian tạo">
          <CalendarOutlined />{" "}
          {record?.createdAt
            ? new Date(record.createdAt).toLocaleString()
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};