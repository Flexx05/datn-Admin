/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm } from "@refinedev/antd";
import { Form, Image, Input, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useState } from "react";
import { CLOUDINARY_URL } from "../../config/dataProvider";

export const BrandCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({
    successNotification: () => ({
      message: "🎉 Thêm mới thành công",
      description: "Thương hiệu đã được thêm mới!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Thêm mới thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>();

  const normFile = (e: any) => e?.fileList?.slice(-1); // Chỉ giữ 1 ảnh

  const handleChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    const latestFile = fileList.slice(-1);
    setFileList(latestFile);

    // Upload lên Cloudinary
    const file = latestFile?.[0]?.originFileObj as File;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      message.error("Vui lòng chỉ tải lên ảnh định dạng JPEG hoặc PNG.");
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Binova_Upload");

      try {
        const { data } = await axios.post(CLOUDINARY_URL, formData);
        if (!data || !data.secure_url) {
          throw new Error("Không nhận được URL từ Cloudinary");
        }
        setUploadedImageUrl(data.secure_url); // Lưu URL trả về
        message.success("Tải ảnh lên thành công!");
      } catch (error) {
        message.error("Lỗi khi upload ảnh!");
        console.error(error);
      }
    }

    // Preview ảnh
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(undefined);
    }
  };

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Tạo thương hiệu"
      isLoading={formLoading}
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
              logoUrl: uploadedImageUrl, // ✅ dùng URL từ Cloudinary
            };

            // Gửi dữ liệu qua API Refine hoặc custom
            await formProps?.onFinish?.(payload);
          } catch (error) {
            message.error("Lỗi khi tạo thương hiệu!");
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
              pattern: /^[\p{L}0-9\s-]+$/u,
              message: "Tên thương hiệu không được chứa ký tự đặc biệt",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name={["logoUrl"]}
          valuePropName="fileList"
          rules={[
            { required: true, message: "Vui lòng tải ảnh cho thương hiệu" },
          ]}
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            maxCount={1}
            beforeUpload={() => false} // Không upload tự động
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              style={{ marginTop: 16, maxWidth: 300 }}
            />
          )}
        </Form.Item>
      </Form>
    </Create>
  );
};
