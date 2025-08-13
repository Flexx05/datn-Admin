/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  UploadFile,
} from "antd";
import { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import axios from "axios";
import { CLOUDINARY_URL } from "../../config/dataProvider";
import Loader from "../../utils/loading";

type Props = {
  record: any;
};

const ButtonChat = ({ record }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const handleUpload = async (files: UploadFile[]) => {
    const updatedFileList = files.slice(0, 5).map((file) => ({
      ...file,
      status: file.status || "uploading",
    }));
    setFileList(updatedFileList);

    const newImageUrls: string[] = [];

    for (let i = 0; i < updatedFileList.length; i++) {
      const file = updatedFileList[i];
      const originFile = file.originFileObj as File;

      if (
        !originFile.type.startsWith("image/") &&
        !originFile.type.startsWith("video/")
      ) {
        message.error("Vui lòng chỉ tải lên ảnh hoặc video.");
        updatedFileList[i] = {
          ...updatedFileList[i],
          status: "error",
        };
        continue; // bỏ qua file này
      }
      const maxSize = 32 * 1024 * 1024; // 32MB
      if (originFile.size > maxSize) {
        message.error(`❌ File "${file.name}" vượt quá 32MB.`);
        updatedFileList[i] = {
          ...updatedFileList[i],
          status: "error",
        };
        continue; // bỏ qua file này
      }

      if (!file.url && originFile) {
        try {
          const formData = new FormData();
          formData.append("file", originFile);
          formData.append("upload_preset", "Binova_Upload");

          const { data } = await axios.post(CLOUDINARY_URL, formData);

          let fileUrl = data.secure_url;

          if (originFile.type.startsWith("image/")) {
            fileUrl = fileUrl.replace("/upload/", "/upload/f_webp/");
          }

          newImageUrls.push(fileUrl);
          updatedFileList[i] = {
            ...updatedFileList[i],
            url: fileUrl,
            status: "done",
          };
        } catch (error) {
          message.error("Lỗi khi upload tệp.");
          console.error(error);
          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "error",
          };
        }
      } else if (file.url) {
        newImageUrls.push(file.url);
      }
    }
    setFileList(updatedFileList);
    setUploadedImageUrls(newImageUrls);
  };
  const handleShow = () => {
    setShowModal(true);
  };
  const handleCancel = () => {
    setShowModal(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && uploadedImageUrls.length === 0) return;
    try {
      setLoading(true);
      await axiosInstance.post(`/send-message/${record._id}`, {
        content: input,
        files: uploadedImageUrls,
      });
      message.success("Tin nhắn đã được gửi thành công!");
      setInput("");
      setShowModal(false);
      setFileList([]);
      setUploadedImageUrls([]);
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
        <Spin spinning={loading} indicator={<Loader />}>
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
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập nội dung tin nhắn..."
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label="Đính kèm ảnh hoặc video">
              <Upload
                maxCount={5}
                accept="image/*,video/*"
                beforeUpload={() => false}
                listType="picture-card"
                onChange={(e) => handleUpload(e.fileList)}
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                fileList={fileList}
              >
                {fileList.length >= 5 ? null : (
                  <div>
                    <PlusOutlined />
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!input.trim() && uploadedImageUrls.length === 0}
                onClick={handleSendMessage}
              >
                Gửi tin nhắn
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default ButtonChat;
