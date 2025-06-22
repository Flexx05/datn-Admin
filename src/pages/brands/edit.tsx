/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, message, Modal, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useEffect, useState } from "react";

export const BrandEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    successNotification: () => ({
      message: "🎉 Cập nhật thành công",
      description: "Thương hiệu đã được cập nhật!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Cập nhật thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>();

  const record = queryResult?.data?.data;

  useEffect(() => {
    if (record?.logoUrl) {
      const initialFile: UploadFile = {
        uid: "-1",
        name: "logo.png",
        status: "done",
        url: record.logoUrl,
      };
      setFileList([initialFile]);
      setPreviewImage(record.logoUrl);
      setUploadedImageUrl(record.logoUrl);
    }
  }, [record]);

  const normFile = (e: any) => e?.fileList?.slice(-1);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setPreviewVisible(true);
      };
      reader.readAsDataURL(file.originFileObj);
    } else {
      setPreviewImage(file.url || file.preview);
      setPreviewVisible(true);
    }
  };

  const handleChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    const latestFile = fileList.slice(-1);
    setFileList(latestFile);

    const file = latestFile[0]?.originFileObj as File;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      message.error("Vui lòng chỉ tải lên ảnh định dạng JPEG hoặc PNG.");
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Binova_Upload");

      const endpoint = "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload";
      try {
        const { data } = await axios.post(endpoint, formData);
        if (!data || !data.secure_url) {
          throw new Error("Không nhận được URL từ Cloudinary");
        }
        setUploadedImageUrl(data.secure_url);
        message.success("Tải ảnh lên thành công!");

        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target?.result as string);
        reader.readAsDataURL(file);
      } catch (error) {
        message.error("Lỗi khi upload ảnh!");
        console.error(error);
      }
    } else {
      setPreviewImage(undefined);
      setUploadedImageUrl(undefined);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setPreviewImage(undefined);
    setUploadedImageUrl(undefined);
    return true; // Phải return true để Ant Design thực sự xóa khỏi UI
  };

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title="Chỉnh sửa thương hiệu"
      isLoading={queryResult?.isLoading}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          try {
            if (!uploadedImageUrl) {
              message.error("Bạn chưa tải ảnh hoặc ảnh chưa upload xong.");
              return;
            }

            if (values.name && typeof values.name === "string") {
              values.name = values.name.trim();
            }

            const payload = {
              name: values.name,
              logoUrl: uploadedImageUrl,
            };

            await formProps?.onFinish?.(payload);
          } catch (error) {
            message.error("Lỗi khi cập nhật thương hiệu!");
            console.error(error);
          }
        }}
      >
        <Form.Item
          label="Tên thương hiệu"
          name={["name"]}
          rules={[
            { required: true, message: "Vui lòng nhập tên thương hiệu" },
            { max: 30, message: "Tên thương hiệu không được quá 30 ký tự" },
            { min: 2, message: "Tên thương hiệu phải có ít nhất 2 ký tự" },
            {
              pattern: /^[\p{L}0-9\s]+$/u,
              message: "Tên thương hiệu không được chứa ký tự đặc biệt",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="logoUrl"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            onPreview={handlePreview}
            onRemove={handleRemove}
            maxCount={1}
            beforeUpload={() => false}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>

          <Modal
            open={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
          >
            <img alt="preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </Form.Item>
      </Form>
    </Edit>
  );
};
