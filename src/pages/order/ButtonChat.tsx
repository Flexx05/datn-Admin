/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
  record: any;
};

const ButtonChat = ({ record }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handleShow = () => {
    setShowModal(true);
  };
  const handleCancel = () => {
    setShowModal(false);
  };

  const handleSendMessage = async () => {
    try {
      if (!input.trim()) {
        message.error("Nội dung tin nhắn không được để trống.");
        return;
      }
      setLoading(true);
      await axiosInstance.post(`/send-message/${record._id}`, {
        content: input,
      });
      message.success("Tin nhắn đã được gửi thành công!");
      setInput("");
      setShowModal(false);
    } catch (error) {
      message.error("Gửi tin nhắn thất bại, vui lòng thử lại sau.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const noInformationTag = <Tag color="red">Chưa có thông tin</Tag>;
  return (
    <>
      <Tooltip title="Chat với khách hàng">
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={() => handleShow()}
        >
          Chat
        </Button>
      </Tooltip>
      <Modal
        open={showModal}
        onCancel={() => handleCancel()}
        footer={null}
        title={`Chat với khách hàng ${record.recipientInfo?.name || ""}`}
      >
        <Typography.Title level={4}>
          Thông tin đơn hàng: {record.orderCode || ""}
        </Typography.Title>
        <Typography.Text>
          Khách hàng: {record.recipientInfo?.name || noInformationTag}
        </Typography.Text>
        <br />
        <Typography.Text>
          Số điện thoại: {record.recipientInfo?.phone || noInformationTag}
        </Typography.Text>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="Nội dung tin nhắn">
            <Input.TextArea
              name="content"
              rows={4}
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!input.trim()}
              onClick={handleSendMessage}
            >
              Gửi tin nhắn
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ButtonChat;
