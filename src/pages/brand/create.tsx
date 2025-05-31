/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm } from "@refinedev/antd";
import { Form, Image, Input, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import axios from "axios";
import { useState } from "react";

export const BrandCreate = () => {
  const { formProps, saveButtonProps } = useForm({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>();

  const normFile = (e: any) => e?.fileList?.slice(-1); // Chỉ giữ 1 ảnh

  const handleChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    const latestFile = fileList.slice(-1);
    setFileList(latestFile);

    // Upload lên Cloudinary
    const file = latestFile?.[0]?.originFileObj as File;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Binova_Upload");

      const endpoint = "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload";

      try {
        const { data } = await axios.post(endpoint, formData);
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
    <Create saveButtonProps={saveButtonProps} title="Tạo thương hiệu">
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          try {
            if (!uploadedImageUrl) {
              message.error("Bạn chưa tải ảnh hoặc ảnh chưa upload xong.");
              return;
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
          rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name={["logoUrl"]}
          valuePropName="fileList"
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
                <div style={{ marginTop: 8 }}>Upload</div>
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
